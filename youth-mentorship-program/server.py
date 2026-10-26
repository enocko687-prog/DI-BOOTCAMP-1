import json
import hashlib
import hmac
import os
import re
import secrets
import sqlite3
import socket
import threading
import webbrowser
from contextlib import contextmanager
from datetime import date, datetime, time, timedelta, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from time import monotonic
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
DATABASE_PATH = Path(
    os.environ.get("MENTORSHIP_DB_PATH", ROOT / "mentorship.sqlite3")
)
MAX_BODY_SIZE = 50_000_000
GROUP_TYPES = {"Church", "Organization", "Community"}
AGE_GROUPS = {
    "Teenagers (13–17)",
    "Young adults (18–25)",
    "Mixed youth group",
}
REQUEST_TOPICS = {
    "Confidence and self-esteem",
    "Education and career",
    "Relationships and boundaries",
    "Emotional wellbeing",
    "Faith and values",
    "Leadership and life skills",
    "Other",
}
MENTOR_TOPICS = {
    "Confidence and self-esteem",
    "Education and career planning",
    "Healthy relationships and boundaries",
    "Emotional wellbeing and asking for support",
    "Faith, values, and personal growth",
    "Leadership and life skills",
    "Study skills and time management",
    "Financial literacy",
}
SESSION_STATUSES = {"planned", "completed"}
PROGRESS_STATUSES = {
    "Not reviewed",
    "Needs follow-up",
    "On track",
    "Goal achieved",
}
PASSWORD_ITERATIONS = 600_000
SESSION_LIFETIME_SECONDS = 8 * 60 * 60
LOGIN_FAILURE_WINDOW_SECONDS = 15 * 60
MAX_LOGIN_FAILURES = 5
ACTIVE_SESSIONS = {}
LOGIN_FAILURES = {}
AUTH_LOCK = threading.RLock()
USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9_.-]{3,32}$")


@contextmanager
def connect_database():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize_database():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with connect_database() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS mentorship_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_type TEXT NOT NULL,
                group_name TEXT NOT NULL,
                age_group TEXT NOT NULL,
                topic TEXT NOT NULL,
                support TEXT NOT NULL,
                mentor_topic TEXT NOT NULL DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS tracker_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                topic TEXT NOT NULL,
                attendance INTEGER NOT NULL,
                status TEXT NOT NULL,
                progress TEXT NOT NULL,
                follow_up_date TEXT NOT NULL DEFAULT '',
                summary TEXT NOT NULL DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS program_schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                topic TEXT NOT NULL,
                focus TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS mentor_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mentor_name TEXT NOT NULL,
                specialty TEXT NOT NULL,
                topics TEXT NOT NULL,
                bio TEXT NOT NULL,
                session_date TEXT NOT NULL,
                session_topic TEXT NOT NULL,
                focus TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                capacity INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS mentor_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                plan_id INTEGER NOT NULL REFERENCES mentor_plans(id) ON DELETE CASCADE,
                attendee_alias TEXT NOT NULL,
                attendee_count INTEGER NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS app_metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS local_admin (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                username TEXT NOT NULL UNIQUE,
                password_salt TEXT NOT NULL,
                password_hash TEXT NOT NULL
            )
            """
        )


def has_local_admin():
    with connect_database() as connection:
        return connection.execute(
            "SELECT 1 FROM local_admin WHERE id = 1"
        ).fetchone() is not None


def hash_password(password, salt):
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_ITERATIONS,
    )


def validate_credentials(payload, *, creating_account=False):
    if not isinstance(payload, dict):
        raise ValueError("Credentials must be a JSON object.")
    username = payload.get("username")
    password = payload.get("password")
    if not isinstance(username, str) or not USERNAME_PATTERN.fullmatch(username):
        raise ValueError("Username must be 3–32 letters, numbers, dots, dashes, or underscores.")
    if not isinstance(password, str) or not 12 <= len(password) <= 128:
        raise ValueError("Password must be between 12 and 128 characters.")
    if creating_account and password != payload.get("confirmPassword"):
        raise ValueError("The password confirmation does not match.")
    return username, password


def client_session(handler):
    cookies = handler.headers.get("Cookie", "")
    session_id = None
    for cookie in cookies.split(";"):
        name, separator, value = cookie.strip().partition("=")
        if separator and name == "mentorship_session":
            session_id = value
            break
    if not session_id:
        return None
    with AUTH_LOCK:
        session = ACTIVE_SESSIONS.get(session_id)
        if session and session["expires"] > monotonic():
            return session_id, session
        ACTIVE_SESSIONS.pop(session_id, None)
    return None


def require_text(record, key, maximum, *, optional=False):
    value = record.get(key, "" if optional else None)
    if not isinstance(value, str):
        raise ValueError(f"{key} must be text.")
    value = value.strip()
    if not optional and not value:
        raise ValueError(f"{key} is required.")
    if len(value) > maximum:
        raise ValueError(f"{key} must be {maximum} characters or fewer.")
    return value


def require_choice(value, key, choices):
    if not isinstance(value, str) or value not in choices:
        raise ValueError(f"{key} has an unsupported value.")
    return value


def require_date(value, key, *, optional=False):
    if optional and value == "":
        return ""
    if not isinstance(value, str):
        raise ValueError(f"{key} must be an ISO date.")
    try:
        return date.fromisoformat(value).isoformat()
    except ValueError as error:
        raise ValueError(f"{key} must be an ISO date.") from error


def validate_request(record):
    if not isinstance(record, dict):
        raise ValueError("Each request must be a JSON object.")
    return {
        "groupType": require_choice(record.get("groupType"), "groupType", GROUP_TYPES),
        "groupName": require_text(record, "groupName", 100, optional=True),
        "ageGroup": require_choice(record.get("ageGroup"), "ageGroup", AGE_GROUPS),
        "topic": require_choice(record.get("topic"), "topic", REQUEST_TOPICS),
        "support": require_text(record, "support", 500),
        "mentorTopic": require_choice(
            record.get("mentorTopic", ""),
            "mentorTopic",
            MENTOR_TOPICS | {""},
        ),
    }


def validate_session(record):
    if not isinstance(record, dict):
        raise ValueError("Each tracker entry must be a JSON object.")
    attendance = record.get("attendance")
    if (
        isinstance(attendance, bool)
        or not isinstance(attendance, int)
        or not 0 <= attendance <= 1000
    ):
        raise ValueError("attendance must be a whole number from 0 to 1000.")
    return {
        "date": require_date(record.get("date"), "date"),
        "topic": require_text(record, "topic", 80),
        "attendance": attendance,
        "status": require_choice(record.get("status"), "status", SESSION_STATUSES),
        "progress": require_choice(
            record.get("progress"), "progress", PROGRESS_STATUSES
        ),
        "followUpDate": require_date(
            record.get("followUpDate", ""), "followUpDate", optional=True
        ),
        "summary": require_text(record, "summary", 240, optional=True),
    }


def validate_schedule(record):
    if not isinstance(record, dict):
        raise ValueError("Each scheduled session must be a JSON object.")
    start_time = require_text(record, "startTime", 5)
    end_time = require_text(record, "endTime", 5)
    try:
        start = time.fromisoformat(start_time)
        end = time.fromisoformat(end_time)
    except ValueError as error:
        raise ValueError("Session times must use HH:MM format.") from error
    if start.second or end.second or end <= start:
        raise ValueError("End time must be later than start time.")
    record_id = record.get("id")
    if record_id is not None and (
        isinstance(record_id, bool)
        or not isinstance(record_id, int)
        or record_id < 1
    ):
        raise ValueError("Schedule id must be a positive integer.")
    return {
        "id": record_id,
        "date": require_date(record.get("date"), "date"),
        "topic": require_text(record, "topic", 100),
        "focus": require_text(record, "focus", 240),
        "startTime": start_time,
        "endTime": end_time,
    }


def validate_mentor_plan(record, *, allow_past=False):
    if not isinstance(record, dict):
        raise ValueError("Each mentor plan must be a JSON object.")
    start_time = require_text(record, "startTime", 5)
    end_time = require_text(record, "endTime", 5)
    try:
        start = time.fromisoformat(start_time)
        end = time.fromisoformat(end_time)
    except ValueError as error:
        raise ValueError("Session times must use HH:MM format.") from error
    if start.second or end.second or end <= start:
        raise ValueError("End time must be later than the start time.")
    capacity = record.get("capacity", 1)
    if isinstance(capacity, bool) or not isinstance(capacity, int) or not 1 <= capacity <= 20:
        raise ValueError("capacity must be a whole number from 1 to 20.")
    session_date = require_date(record.get("sessionDate"), "sessionDate")
    if (
        not allow_past
        and session_date < datetime.now(timezone(timedelta(hours=3))).date().isoformat()
    ):
        raise ValueError("Session date must be today or a future date.")
    record_id = record.get("id")
    if record_id is not None and (
        isinstance(record_id, bool)
        or not isinstance(record_id, int)
        or record_id < 1
    ):
        raise ValueError("Mentor plan id must be a positive integer.")
    return {
        "id": record_id,
        "mentorName": require_text(record, "mentorName", 80),
        "specialty": require_text(record, "specialty", 80),
        "topics": require_text(record, "topics", 160),
        "bio": require_text(record, "bio", 300),
        "sessionDate": session_date,
        "sessionTopic": require_text(record, "sessionTopic", 100),
        "focus": require_text(record, "focus", 240),
        "startTime": start_time,
        "endTime": end_time,
        "capacity": capacity,
    }


def validate_booking(record):
    if not isinstance(record, dict):
        raise ValueError("A booking must be a JSON object.")
    plan_id = record.get("planId")
    attendee_count = record.get("attendeeCount", 1)
    if isinstance(plan_id, bool) or not isinstance(plan_id, int) or plan_id < 1:
        raise ValueError("planId must be a positive integer.")
    if (
        isinstance(attendee_count, bool)
        or not isinstance(attendee_count, int)
        or not 1 <= attendee_count <= 20
    ):
        raise ValueError("attendeeCount must be a whole number from 1 to 20.")
    record_id = record.get("id")
    if record_id is not None and (
        isinstance(record_id, bool)
        or not isinstance(record_id, int)
        or record_id < 1
    ):
        raise ValueError("Booking id must be a positive integer.")
    created_at = record.get("createdAt", "")
    if not isinstance(created_at, str) or len(created_at) > 64:
        raise ValueError("createdAt must be a valid timestamp.")
    return {
        "id": record_id,
        "planId": plan_id,
        "attendeeAlias": require_text(record, "attendeeAlias", 60),
        "attendeeCount": attendee_count,
        "createdAt": created_at,
    }


def row_to_request(row):
    return {
        "id": row["id"],
        "groupType": row["group_type"],
        "groupName": row["group_name"],
        "ageGroup": row["age_group"],
        "topic": row["topic"],
        "support": row["support"],
        "mentorTopic": row["mentor_topic"],
    }


def row_to_session(row):
    return {
        "id": row["id"],
        "date": row["date"],
        "topic": row["topic"],
        "attendance": row["attendance"],
        "status": row["status"],
        "progress": row["progress"],
        "followUpDate": row["follow_up_date"],
        "summary": row["summary"],
    }


def row_to_schedule(row):
    return {
        "id": row["id"],
        "date": row["date"],
        "topic": row["topic"],
        "focus": row["focus"],
        "startTime": row["start_time"],
        "endTime": row["end_time"],
    }


def row_to_mentor_plan(row):
    booked = row["booked"] if "booked" in row.keys() else 0
    return {
        "id": row["id"],
        "mentorName": row["mentor_name"],
        "specialty": row["specialty"],
        "topics": row["topics"],
        "bio": row["bio"],
        "sessionDate": row["session_date"],
        "sessionTopic": row["session_topic"],
        "focus": row["focus"],
        "startTime": row["start_time"],
        "endTime": row["end_time"],
        "capacity": row["capacity"],
        "booked": booked,
        "available": row["capacity"] - booked,
    }


def row_to_booking(row):
    return {
        "id": row["id"],
        "planId": row["plan_id"],
        "attendeeAlias": row["attendee_alias"],
        "attendeeCount": row["attendee_count"],
        "createdAt": row["created_at"],
        "mentorName": row["mentor_name"],
        "specialty": row["specialty"],
        "sessionDate": row["session_date"],
        "sessionTopic": row["session_topic"],
        "startTime": row["start_time"],
        "endTime": row["end_time"],
    }

class MentorshipHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        cookie_header = getattr(self, "auth_cookie_header", None)
        if cookie_header:
            self.send_header("Set-Cookie", cookie_header)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def parse_request(self):
        if not super().parse_request():
            return False
        host = self.headers.get("Host", "")
        if not re.fullmatch(
            r"(?:127\.0\.0\.1|localhost|\[::1\])(?::\d{1,5})?",
            host,
        ):
            self.send_json(403, {"error": "This local app only accepts loopback requests."})
            return False
        origin = self.headers.get("Origin")
        if origin and origin != f"http://{host}":
            self.send_json(403, {"error": "Cross-origin requests are not allowed."})
            return False
        return True

    def authentication_required(self):
        path = urlparse(self.path).path
        if not path.startswith("/api/") or path in {
            "/api/health",
            "/api/auth/status",
            "/api/auth/setup",
            "/api/auth/login",
        }:
            return False
        current_session = client_session(self)
        if not current_session:
            self.send_json(401, {"error": "Sign in to use the local data API."})
            return True
        if self.command in {"POST", "PUT", "PATCH", "DELETE"}:
            csrf_token = self.headers.get("X-CSRF-Token", "")
            if not hmac.compare_digest(csrf_token, current_session[1]["csrf"]):
                self.send_json(403, {"error": "The request could not be verified. Sign in again."})
                return True
        return False

    def create_session(self, username):
        session_id = secrets.token_urlsafe(32)
        csrf_token = secrets.token_urlsafe(32)
        with AUTH_LOCK:
            ACTIVE_SESSIONS[session_id] = {
                "username": username,
                "csrf": csrf_token,
                "expires": monotonic() + SESSION_LIFETIME_SECONDS,
            }
        self.auth_cookie_header = (
            f"mentorship_session={session_id}; Path=/; HttpOnly; SameSite=Strict; "
            f"Max-Age={SESSION_LIFETIME_SECONDS}"
        )
        return csrf_token

    def login_failure_limited(self):
        now = monotonic()
        address = self.client_address[0]
        with AUTH_LOCK:
            failures = [
                timestamp
                for timestamp in LOGIN_FAILURES.get(address, [])
                if now - timestamp < LOGIN_FAILURE_WINDOW_SECONDS
            ]
            LOGIN_FAILURES[address] = failures
            return len(failures) >= MAX_LOGIN_FAILURES

    def record_login_failure(self):
        with AUTH_LOCK:
            LOGIN_FAILURES.setdefault(self.client_address[0], []).append(monotonic())

    def clear_login_failures(self):
        with AUTH_LOCK:
            LOGIN_FAILURES.pop(self.client_address[0], None)

    def handle_auth_status(self):
        account_exists = has_local_admin()
        current_session = client_session(self)
        payload = {
            "setupRequired": not account_exists,
            "authenticated": current_session is not None,
        }
        if current_session:
            payload["username"] = current_session[1]["username"]
            payload["csrfToken"] = current_session[1]["csrf"]
        self.send_json(200, payload)

    def handle_account_setup(self):
        try:
            payload = self.read_json()
            username, password = validate_credentials(payload, creating_account=True)
            salt = secrets.token_bytes(16)
            password_hash = hash_password(password, salt)
            with connect_database() as connection:
                connection.execute("BEGIN IMMEDIATE")
                if connection.execute(
                    "SELECT 1 FROM local_admin WHERE id = 1"
                ).fetchone():
                    self.send_json(409, {"error": "The local account is already set up. Sign in instead."})
                    return
                connection.execute(
                    """
                    INSERT INTO local_admin (id, username, password_salt, password_hash)
                    VALUES (1, ?, ?, ?)
                    """,
                    (username, salt.hex(), password_hash.hex()),
                )
            self.clear_login_failures()
            csrf_token = self.create_session(username)
            self.send_json(
                201,
                {"authenticated": True, "username": username, "csrfToken": csrf_token},
            )
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
        except sqlite3.IntegrityError:
            self.send_json(409, {"error": "That username is already in use."})
        except sqlite3.Error:
            self.log_error("Account setup failed")
            self.send_json(500, {"error": "The local account could not be created."})

    def handle_login(self):
        if self.login_failure_limited():
            self.send_json(
                429,
                {"error": "Too many sign-in attempts. Wait 15 minutes before trying again."},
            )
            return
        try:
            payload = self.read_json()
            username, password = validate_credentials(payload)
        except ValueError:
            self.record_login_failure()
            self.send_json(401, {"error": "Username or password is incorrect."})
            return
        try:
            with connect_database() as connection:
                account = connection.execute(
                    "SELECT username, password_salt, password_hash FROM local_admin WHERE id = 1"
                ).fetchone()
            if account:
                salt = bytes.fromhex(account["password_salt"])
                expected_hash = bytes.fromhex(account["password_hash"])
                valid = hmac.compare_digest(hash_password(password, salt), expected_hash)
                valid = valid and hmac.compare_digest(username, account["username"])
            else:
                hash_password(password, b"mentorship-demo-dummy")
                valid = False
        except (sqlite3.Error, ValueError):
            self.log_error("Unable to verify local credentials")
            self.send_json(500, {"error": "The local account could not be checked."})
            return
        if not valid:
            self.record_login_failure()
            self.send_json(401, {"error": "Username or password is incorrect."})
            return
        self.clear_login_failures()
        csrf_token = self.create_session(account["username"])
        self.send_json(
            200,
            {
                "authenticated": True,
                "username": account["username"],
                "csrfToken": csrf_token,
            },
        )

    def handle_logout(self):
        current_session = client_session(self)
        if current_session:
            with AUTH_LOCK:
                ACTIVE_SESSIONS.pop(current_session[0], None)
        self.auth_cookie_header = (
            "mentorship_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
        )
        self.send_json(200, {"authenticated": False})

    def read_json(self):
        content_type = self.headers.get("Content-Type", "")
        if content_type.split(";", 1)[0].strip().lower() != "application/json":
            raise ValueError("Content-Type must be application/json.")
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ValueError("Invalid Content-Length.") from error
        if length < 1 or length > MAX_BODY_SIZE:
            raise ValueError("Request body must be between 1 byte and 50 MB.")
        try:
            return json.loads(self.rfile.read(length))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ValueError("Request body must contain valid JSON.") from error

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/health":
            self.send_json(200, {"status": "ok", "storage": "local SQLite"})
            return
        if path == "/api/auth/status":
            self.handle_auth_status()
            return
        if path == "/api/mentors":
            with connect_database() as connection:
                rows = connection.execute(
                    """
                    SELECT mentor_plans.*,
                        COALESCE(SUM(mentor_bookings.attendee_count), 0) AS booked
                    FROM mentor_plans
                    LEFT JOIN mentor_bookings ON mentor_bookings.plan_id = mentor_plans.id
                    GROUP BY mentor_plans.id
                    ORDER BY session_date, start_time, mentor_name
                    """
                ).fetchall()
            self.send_json(200, [row_to_mentor_plan(row) for row in rows])
            return
        if self.authentication_required():
            return
        if path == "/api/bookings":
            with connect_database() as connection:
                rows = connection.execute(
                    """
                    SELECT mentor_bookings.*, mentor_plans.mentor_name,
                        mentor_plans.specialty, mentor_plans.session_date,
                        mentor_plans.session_topic, mentor_plans.start_time,
                        mentor_plans.end_time
                    FROM mentor_bookings
                    JOIN mentor_plans ON mentor_plans.id = mentor_bookings.plan_id
                    ORDER BY mentor_plans.session_date, mentor_plans.start_time,
                        mentor_bookings.id
                    """
                ).fetchall()
            self.send_json(200, [row_to_booking(row) for row in rows])
            return
        if path == "/api/requests":
            with connect_database() as connection:
                rows = connection.execute(
                    "SELECT * FROM mentorship_requests ORDER BY id"
                ).fetchall()
            self.send_json(200, [row_to_request(row) for row in rows])
            return
        if path == "/api/sessions":
            with connect_database() as connection:
                rows = connection.execute(
                    "SELECT * FROM tracker_sessions ORDER BY id"
                ).fetchall()
            self.send_json(200, [row_to_session(row) for row in rows])
            return
        if path == "/api/schedule":
            with connect_database() as connection:
                rows = connection.execute(
                    "SELECT * FROM program_schedule ORDER BY date, start_time, id"
                ).fetchall()
                initialized = connection.execute(
                    "SELECT 1 FROM app_metadata WHERE key = 'schedule_initialized'"
                ).fetchone() is not None
            self.send_json(
                200,
                {
                    "records": [row_to_schedule(row) for row in rows],
                    "initialized": initialized,
                },
            )
            return
        if path == "/api/export":
            with connect_database() as connection:
                requests = connection.execute(
                    "SELECT * FROM mentorship_requests ORDER BY id"
                ).fetchall()
                sessions = connection.execute(
                    "SELECT * FROM tracker_sessions ORDER BY id"
                ).fetchall()
                schedule = connection.execute(
                    "SELECT * FROM program_schedule ORDER BY id"
                ).fetchall()
                mentor_plans = connection.execute(
                    "SELECT * FROM mentor_plans ORDER BY id"
                ).fetchall()
                bookings = connection.execute(
                    """
                    SELECT mentor_bookings.*, mentor_plans.mentor_name,
                        mentor_plans.specialty, mentor_plans.session_date,
                        mentor_plans.session_topic, mentor_plans.start_time,
                        mentor_plans.end_time
                    FROM mentor_bookings
                    JOIN mentor_plans ON mentor_plans.id = mentor_bookings.plan_id
                    ORDER BY mentor_bookings.id
                    """
                ).fetchall()
            self.send_json(
                200,
                {
                    "schemaVersion": 2,
                    "exportedAt": datetime.now(timezone.utc).isoformat(),
                    "requests": [row_to_request(row) for row in requests],
                    "sessions": [row_to_session(row) for row in sessions],
                    "schedule": [row_to_schedule(row) for row in schedule],
                    "mentorPlans": [
                        {
                            key: value
                            for key, value in row_to_mentor_plan(row).items()
                            if key not in {"booked", "available"}
                        }
                        for row in mentor_plans
                    ],
                    "bookings": [row_to_booking(row) for row in bookings],
                },
            )
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/auth/setup":
            self.handle_account_setup()
            return
        if path == "/api/auth/login":
            self.handle_login()
            return
        if path == "/api/auth/logout":
            if self.authentication_required():
                return
            self.handle_logout()
            return
        if path != "/api/bookings" and self.authentication_required():
            return
        try:
            payload = self.read_json()
            if path == "/api/bookings":
                record = validate_booking(payload)
                with connect_database() as connection:
                    connection.execute("BEGIN IMMEDIATE")
                    plan = connection.execute(
                        "SELECT capacity, session_date FROM mentor_plans WHERE id = ?",
                        (record["planId"],),
                    ).fetchone()
                    if not plan:
                        self.send_json(404, {"error": "Mentor session not found."})
                        return
                    eat_today = datetime.now(
                        timezone(timedelta(hours=3))
                    ).date().isoformat()
                    if plan["session_date"] < eat_today:
                        self.send_json(409, {"error": "This mentor session has already passed."})
                        return
                    booked = connection.execute(
                        """
                        SELECT COALESCE(SUM(attendee_count), 0)
                        FROM mentor_bookings WHERE plan_id = ?
                        """,
                        (record["planId"],),
                    ).fetchone()[0]
                    if booked + record["attendeeCount"] > plan["capacity"]:
                        self.send_json(409, {"error": "There are not enough places left in this session."})
                        return
                    created_at = datetime.now(timezone.utc).isoformat()
                    cursor = connection.execute(
                        """
                        INSERT INTO mentor_bookings
                            (plan_id, attendee_alias, attendee_count, created_at)
                        VALUES (?, ?, ?, ?)
                        """,
                        (
                            record["planId"],
                            record["attendeeAlias"],
                            record["attendeeCount"],
                            created_at,
                        ),
                    )
                    booking_id = cursor.lastrowid
                record["id"] = booking_id
                record["createdAt"] = created_at
                self.send_json(201, record)
                return
            if path == "/api/mentors":
                record = validate_mentor_plan(payload)
                with connect_database() as connection:
                    cursor = connection.execute(
                        """
                        INSERT INTO mentor_plans
                            (mentor_name, specialty, topics, bio, session_date,
                                session_topic, focus, start_time, end_time, capacity)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            record["mentorName"],
                            record["specialty"],
                            record["topics"],
                            record["bio"],
                            record["sessionDate"],
                            record["sessionTopic"],
                            record["focus"],
                            record["startTime"],
                            record["endTime"],
                            record["capacity"],
                        ),
                    )
                    record["id"] = cursor.lastrowid
                record.update({"booked": 0, "available": record["capacity"]})
                self.send_json(201, record)
                return
            if path == "/api/requests":
                record = validate_request(payload)
                with connect_database() as connection:
                    cursor = connection.execute(
                        """
                        INSERT INTO mentorship_requests
                            (group_type, group_name, age_group, topic, support, mentor_topic)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (
                            record["groupType"],
                            record["groupName"],
                            record["ageGroup"],
                            record["topic"],
                            record["support"],
                            record["mentorTopic"],
                        ),
                    )
                    record["id"] = cursor.lastrowid
                self.send_json(201, record)
                return
            if path == "/api/sessions":
                record = validate_session(payload)
                with connect_database() as connection:
                    cursor = connection.execute(
                        """
                        INSERT INTO tracker_sessions
                            (date, topic, attendance, status, progress, follow_up_date, summary)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            record["date"],
                            record["topic"],
                            record["attendance"],
                            record["status"],
                            record["progress"],
                            record["followUpDate"],
                            record["summary"],
                        ),
                    )
                    record["id"] = cursor.lastrowid
                self.send_json(201, record)
                return
            if path == "/api/import":
                self.import_data(payload)
                self.send_json(200, {"status": "imported"})
                return
            self.send_json(404, {"error": "API endpoint not found."})
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
        except sqlite3.Error:
            self.log_error("Database operation failed")
            self.send_json(500, {"error": "The local database operation failed."})

    def do_PUT(self):
        if self.authentication_required():
            return
        if urlparse(self.path).path != "/api/schedule":
            self.send_json(404, {"error": "API endpoint not found."})
            return
        try:
            payload = self.read_json()
            if not isinstance(payload, list) or len(payload) > 5000:
                raise ValueError("schedule must be a JSON array of at most 5000 entries.")
            records = [validate_schedule(record) for record in payload]
            ids = [record["id"] for record in records if record["id"] is not None]
            if len(ids) != len(set(ids)):
                raise ValueError("Schedule ids must be unique.")
            with connect_database() as connection:
                connection.execute("DELETE FROM program_schedule")
                connection.execute(
                    "INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('schedule_initialized', 'true')"
                )
                for record in records:
                    values = (
                        record["date"],
                        record["topic"],
                        record["focus"],
                        record["startTime"],
                        record["endTime"],
                    )
                    if record["id"] is None:
                        connection.execute(
                            """
                            INSERT INTO program_schedule
                                (date, topic, focus, start_time, end_time)
                            VALUES (?, ?, ?, ?, ?)
                            """,
                            values,
                        )
                    else:
                        connection.execute(
                            """
                            INSERT INTO program_schedule
                                (id, date, topic, focus, start_time, end_time)
                            VALUES (?, ?, ?, ?, ?, ?)
                            """,
                            (record["id"], *values),
                        )
                rows = connection.execute(
                    "SELECT * FROM program_schedule ORDER BY date, start_time, id"
                ).fetchall()
            self.send_json(200, [row_to_schedule(row) for row in rows])
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
        except sqlite3.Error:
            self.log_error("Database operation failed")
            self.send_json(500, {"error": "The local database operation failed."})

    def do_PATCH(self):
        if self.authentication_required():
            return
        match = re.fullmatch(r"/api/requests/([1-9][0-9]*)", urlparse(self.path).path)
        if not match:
            self.send_json(404, {"error": "API endpoint not found."})
            return
        try:
            payload = self.read_json()
            if not isinstance(payload, dict) or set(payload) != {"mentorTopic"}:
                raise ValueError("Only mentorTopic may be updated.")
            topic = require_choice(
                payload["mentorTopic"], "mentorTopic", MENTOR_TOPICS | {""}
            )
            with connect_database() as connection:
                cursor = connection.execute(
                    "UPDATE mentorship_requests SET mentor_topic = ? WHERE id = ?",
                    (topic, int(match.group(1))),
                )
                row = connection.execute(
                    "SELECT * FROM mentorship_requests WHERE id = ?",
                    (int(match.group(1)),),
                ).fetchone()
            if cursor.rowcount == 0:
                self.send_json(404, {"error": "Request not found."})
                return
            self.send_json(200, row_to_request(row))
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
        except sqlite3.Error:
            self.log_error("Database operation failed")
            self.send_json(500, {"error": "The local database operation failed."})

    def do_DELETE(self):
        if self.authentication_required():
            return
        match = re.fullmatch(
            r"/api/(sessions|mentors)/([1-9][0-9]*)",
            urlparse(self.path).path,
        )
        if not match:
            self.send_json(404, {"error": "API endpoint not found."})
            return
        table = "tracker_sessions" if match.group(1) == "sessions" else "mentor_plans"
        not_found = (
            "Tracker entry not found."
            if match.group(1) == "sessions"
            else "Mentor plan not found."
        )
        try:
            with connect_database() as connection:
                cursor = connection.execute(
                    f"DELETE FROM {table} WHERE id = ?", (int(match.group(2)),)
                )
            if cursor.rowcount == 0:
                self.send_json(404, {"error": not_found})
                return
            self.send_json(200, {"status": "deleted"})
        except sqlite3.Error:
            self.log_error("Database operation failed")
            self.send_json(500, {"error": "The local database operation failed."})

    def import_data(self, payload):
        if (
            not isinstance(payload, dict)
            or payload.get("schemaVersion") not in {1, 2}
        ):
            raise ValueError("Import must be a supported JSON backup (schemaVersion 1 or 2).")
        if not all(key in payload for key in ("requests", "sessions", "schedule")):
            raise ValueError("Import must contain requests, sessions, and schedule arrays.")
        collections = {
            "requests": (payload["requests"], validate_request, 5000),
            "sessions": (payload["sessions"], validate_session, 5000),
            "schedule": (payload["schedule"], validate_schedule, 5000),
            "mentorPlans": (
                payload.get("mentorPlans", []),
                lambda item: validate_mentor_plan(item, allow_past=True),
                5000,
            ),
            "bookings": (payload.get("bookings", []), validate_booking, 5000),
        }
        normalized = {}
        for name, (items, validator, limit) in collections.items():
            if not isinstance(items, list) or len(items) > limit:
                raise ValueError(f"{name} must be an array of at most {limit} entries.")
            normalized[name] = [validator(item) for item in items]

        plan_ids = [record["id"] for record in normalized["mentorPlans"]]
        booking_ids = [record["id"] for record in normalized["bookings"]]
        if None in plan_ids or len(plan_ids) != len(set(plan_ids)):
            raise ValueError("Imported mentor plan ids must be present and unique.")
        if None in booking_ids or len(booking_ids) != len(set(booking_ids)):
            raise ValueError("Imported booking ids must be present and unique.")
        plans_by_id = {
            record["id"]: record for record in normalized["mentorPlans"]
        }
        bookings_per_plan = {}
        for record in normalized["bookings"]:
            plan = plans_by_id.get(record["planId"])
            if not plan:
                raise ValueError("Each imported booking must refer to an imported mentor plan.")
            bookings_per_plan[record["planId"]] = (
                bookings_per_plan.get(record["planId"], 0)
                + record["attendeeCount"]
            )
            if bookings_per_plan[record["planId"]] > plan["capacity"]:
                raise ValueError("Imported bookings exceed a mentor session's capacity.")

        with connect_database() as connection:
            connection.execute("DELETE FROM mentorship_requests")
            connection.execute("DELETE FROM tracker_sessions")
            connection.execute("DELETE FROM program_schedule")
            connection.execute("DELETE FROM mentor_bookings")
            connection.execute("DELETE FROM mentor_plans")
            connection.execute(
                "INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('schedule_initialized', 'true')"
            )
            for record in normalized["requests"]:
                connection.execute(
                    """
                    INSERT INTO mentorship_requests
                        (group_type, group_name, age_group, topic, support, mentor_topic)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        record["groupType"],
                        record["groupName"],
                        record["ageGroup"],
                        record["topic"],
                        record["support"],
                        record["mentorTopic"],
                    ),
                )
            for record in normalized["sessions"]:
                connection.execute(
                    """
                    INSERT INTO tracker_sessions
                        (date, topic, attendance, status, progress, follow_up_date, summary)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        record["date"],
                        record["topic"],
                        record["attendance"],
                        record["status"],
                        record["progress"],
                        record["followUpDate"],
                        record["summary"],
                    ),
                )
            for record in normalized["schedule"]:
                connection.execute(
                    """
                    INSERT INTO program_schedule
                        (date, topic, focus, start_time, end_time)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        record["date"],
                        record["topic"],
                        record["focus"],
                        record["startTime"],
                        record["endTime"],
                    ),
                )
            for record in normalized["mentorPlans"]:
                connection.execute(
                    """
                    INSERT INTO mentor_plans
                        (id, mentor_name, specialty, topics, bio, session_date,
                            session_topic, focus, start_time, end_time, capacity)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        record["id"],
                        record["mentorName"],
                        record["specialty"],
                        record["topics"],
                        record["bio"],
                        record["sessionDate"],
                        record["sessionTopic"],
                        record["focus"],
                        record["startTime"],
                        record["endTime"],
                        record["capacity"],
                    ),
                )
            for record in normalized["bookings"]:
                connection.execute(
                    """
                    INSERT INTO mentor_bookings
                        (id, plan_id, attendee_alias, attendee_count, created_at)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        record["id"],
                        record["planId"],
                        record["attendeeAlias"],
                        record["attendeeCount"],
                        record["createdAt"],
                    ),
                )


def main():
    initialize_database()
    server = ThreadingHTTPServer(("127.0.0.1", 8000), MentorshipHandler)
    ipv6_server = None
    try:
        class IPv6ThreadingHTTPServer(ThreadingHTTPServer):
            address_family = socket.AF_INET6

            def server_bind(self):
                self.socket.setsockopt(
                    socket.IPPROTO_IPV6,
                    socket.IPV6_V6ONLY,
                    1,
                )
                super().server_bind()

        ipv6_server = IPv6ThreadingHTTPServer(("::1", 8000), MentorshipHandler)
    except OSError as error:
        print(f"IPv6 localhost is unavailable; using IPv4 localhost only: {error}")

    print("Youth Mentorship demo running at http://localhost:8000")
    print(f"SQLite data stored locally at {DATABASE_PATH}")
    if ipv6_server:
        ipv6_thread = threading.Thread(
            target=ipv6_server.serve_forever,
            daemon=True,
        )
        ipv6_thread.start()
    webbrowser.open("http://localhost:8000")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping local server.")
    finally:
        server.server_close()
        if ipv6_server:
            ipv6_server.shutdown()
            ipv6_server.server_close()


if __name__ == "__main__":
    main()
