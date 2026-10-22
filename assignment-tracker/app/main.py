from __future__ import annotations

import hashlib
import hmac
import os
import re
import secrets
import threading
import time
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated, Literal

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pymongo import ASCENDING, MongoClient
from pymongo.errors import DuplicateKeyError
from starlette.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

SUBJECTS = (
    "Mathematics",
    "English",
    "Kiswahili",
    "Science",
    "Social Studies",
    "CRE",
    "Computer Studies",
    "Other",
)
ROLES = ("student", "teacher", "director", "admin")
STAFF_ROLES = ("teacher", "admin")
ROLE_INVITE_VARIABLES = {
    "teacher": "TEACHER_INVITE_CODE",
    "director": "DIRECTOR_INVITE_CODE",
    "admin": "ADMIN_INVITE_CODE",
}
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PASSWORD_ITERATIONS = 600_000
SESSION_COOKIE = "studyspace_session"
SESSION_SECONDS = 7 * 24 * 60 * 60
AUTH_LIMIT = 12
AUTH_WINDOW_SECONDS = 15 * 60
auth_attempts: dict[str, list[float]] = {}
auth_attempts_lock = threading.Lock()


def validate_email(email: str) -> str:
    normalized = email.strip().lower()
    if len(normalized) > 254 or not EMAIL_PATTERN.fullmatch(normalized):
        raise ValueError("Enter a valid email address.")
    return normalized


def hash_password(password: str, salt: bytes | None = None) -> str:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 1024:
        raise ValueError("Password is too long.")
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password_bytes, salt, PASSWORD_ITERATIONS
    )
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = encoded.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        candidate = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iterations),
        )
        return hmac.compare_digest(candidate.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def make_session_token(user_id: str, secret: str) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": user_id, "iat": now, "exp": now + timedelta(seconds=SESSION_SECONDS)},
        secret,
        algorithm="HS256",
    )


def check_auth_rate_limit(client_ip: str, now: float | None = None) -> None:
    current_time = time.monotonic() if now is None else now
    oldest_allowed = current_time - AUTH_WINDOW_SECONDS
    with auth_attempts_lock:
        for address in list(auth_attempts):
            recent = [attempt for attempt in auth_attempts[address] if attempt > oldest_allowed]
            if recent:
                auth_attempts[address] = recent
            else:
                del auth_attempts[address]

        recent_attempts = auth_attempts.get(client_ip, [])
        if len(recent_attempts) >= AUTH_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many sign-in attempts. Please try again in a few minutes.",
                headers={"Retry-After": str(AUTH_WINDOW_SECONDS)},
            )
        auth_attempts.setdefault(client_ip, []).append(current_time)


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Credentials(StrictModel):
    email: str = Field(max_length=254)
    password: str = Field(min_length=10, max_length=128)
    role: Literal["student", "teacher", "director", "admin"] = "student"
    inviteCode: str | None = Field(default=None, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return validate_email(value)


class AssignmentCreate(StrictModel):
    title: str = Field(min_length=1, max_length=100)
    subject: Literal[
        "Mathematics",
        "English",
        "Kiswahili",
        "Science",
        "Social Studies",
        "CRE",
        "Computer Studies",
        "Other",
    ]
    dueDate: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    studentId: str | None = Field(default=None, max_length=64)

    @field_validator("title")
    @classmethod
    def trim_title(cls, value: str) -> str:
        title = value.strip()
        if not title:
            raise ValueError("Assignment name cannot be blank.")
        return title

    @field_validator("dueDate")
    @classmethod
    def validate_due_date(cls, value: str) -> str:
        try:
            date.fromisoformat(value)
        except ValueError as error:
            raise ValueError("Enter a valid due date.") from error
        return value


class AssignmentSubmission(StrictModel):
    submissionNote: str = Field(default="", max_length=2000)

    @field_validator("submissionNote")
    @classmethod
    def trim_submission_note(cls, value: str) -> str:
        return value.strip()


class AssignmentReview(StrictModel):
    decision: Literal["approved", "revision_requested"]
    feedback: str = Field(default="", max_length=2000)

    @field_validator("feedback")
    @classmethod
    def trim_feedback(cls, value: str) -> str:
        return value.strip()


class RoleUpdate(StrictModel):
    role: Literal["student", "teacher", "director", "admin"]


@asynccontextmanager
async def lifespan(application: FastAPI):
    mongo_uri = os.getenv("MONGODB_URI")
    session_secret = os.getenv("SESSION_SECRET", "")
    if not mongo_uri:
        raise RuntimeError("MONGODB_URI is missing. Configure it in the .env file.")
    if len(session_secret) < 32:
        raise RuntimeError("SESSION_SECRET must contain at least 32 characters.")

    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10_000)
    try:
        client.admin.command("ping")
    except Exception:
        client.close()
        raise

    database = client.get_default_database()
    if database is None:
        client.close()
        raise RuntimeError("MONGODB_URI must include a database name.")

    database.users.create_index([("email", ASCENDING)], unique=True)
    database.assignments.create_index([("owner", ASCENDING), ("dueDate", ASCENDING)])
    database.assignments.create_index([("status", ASCENDING), ("dueDate", ASCENDING)])
    application.state.mongo_client = client
    application.state.database = database
    try:
        yield
    finally:
        client.close()


app = FastAPI(
    title="Studyspace API",
    description="Private assignment tracking API.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def add_security_headers_and_check_origin(request: Request, call_next):
    if request.url.path.startswith("/api"):
        origin = request.headers.get("origin")
        if origin:
            configured_origin = os.getenv("APP_ORIGIN", "").rstrip("/")
            request_origin = f"{request.url.scheme}://{request.headers.get('host', '')}"
            allowed_origins = {
                request_origin,
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            }
            if configured_origin:
                allowed_origins.add(configured_origin)
            if origin.rstrip("/") not in allowed_origins:
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"error": "Request origin is not allowed."},
                )

        content_length = request.headers.get("content-length")
        if content_length and content_length.isdigit() and int(content_length) > 10_240:
            return JSONResponse(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                content={"error": "Request is too large."},
            )

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; "
        "form-action 'self'; img-src 'self' data:; script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:"
    )
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, error: HTTPException):
    return JSONResponse(
        status_code=error.status_code,
        content={"error": str(error.detail)},
        headers=error.headers or {},
    )


@app.exception_handler(RequestValidationError)
async def request_validation_handler(request: Request, error: RequestValidationError):
    errors = error.errors()
    message = errors[0]["msg"] if errors else "Invalid request."
    if message.startswith("Value error, "):
        message = message.removeprefix("Value error, ")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": message},
    )


def get_database(request: Request):
    database = getattr(request.app.state, "database", None)
    if database is None:
        raise HTTPException(status_code=503, detail="The database is not available.")
    return database


Database = Annotated[object, Depends(get_database)]


def get_signed_in_user(request: Request, database: Database) -> dict:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Please sign in to continue.")

    try:
        payload = jwt.decode(
            token,
            os.environ["SESSION_SECRET"],
            algorithms=["HS256"],
            options={"require": ["exp", "sub"]},
        )
    except InvalidTokenError as error:
        raise HTTPException(
            status_code=401,
            detail="Your session has expired. Please sign in again.",
            headers={"Set-Cookie": f"{SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict"},
        ) from error

    from bson import ObjectId

    user_id = payload.get("sub", "")
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Please sign in to continue.")

    user = database.users.find_one(
        {"_id": ObjectId(user_id)}, {"email": 1, "role": 1}
    )
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Your account is no longer available. Please sign in again.",
        )
    user["role"] = user.get("role", "student")
    return user


CurrentUser = Annotated[dict, Depends(get_signed_in_user)]


def set_session_cookie(response: Response, user_id: str) -> None:
    token = make_session_token(user_id, os.environ["SESSION_SECRET"])
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_SECONDS,
        httponly=True,
        secure=os.getenv("APP_ENV", "development").lower() == "production",
        samesite="strict",
        path="/",
    )


def public_user(user: dict) -> dict[str, str]:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "role": user.get("role", "student"),
    }


def public_assignment(assignment: dict) -> dict:
    # Legacy completion was student-editable, so it must be reviewed by staff.
    legacy_status = "submitted" if assignment.get("completed") else "pending"
    assignment_status = assignment.get("status", legacy_status)
    return {
        "_id": str(assignment["_id"]),
        "title": assignment["title"],
        "subject": assignment["subject"],
        "dueDate": assignment["dueDate"],
        "status": assignment_status,
        "completed": assignment_status == "approved",
        "submissionNote": assignment.get("submissionNote", ""),
        "submittedAt": assignment.get("submittedAt"),
        "feedback": assignment.get("feedback", ""),
        "studentEmail": assignment.get("studentEmail", ""),
    }


def require_staff(user: dict) -> None:
    if user.get("role", "student") not in STAFF_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and administrators can perform this action.",
        )


def require_admin(user: dict) -> None:
    if user.get("role", "student") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access is required.",
        )


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(credentials: Credentials, request: Request, response: Response, database: Database):
    check_auth_rate_limit(request.client.host if request.client else "unknown")
    role = credentials.role
    if role != "student":
        invite_variable = ROLE_INVITE_VARIABLES[role]
        configured_code = os.getenv(invite_variable, "")
        if (
            not configured_code
            or not credentials.inviteCode
            or not hmac.compare_digest(credentials.inviteCode, configured_code)
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"A valid {role} invitation code is required.",
            )
        if role == "admin" and database.users.count_documents({"role": "admin"}):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Administrator accounts must be granted by an existing administrator.",
            )

    user = {
        "email": credentials.email,
        "passwordHash": hash_password(credentials.password),
        "role": role,
        "createdAt": datetime.now(timezone.utc),
    }
    try:
        inserted = database.users.insert_one(user)
    except DuplicateKeyError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from error

    user["_id"] = inserted.inserted_id
    set_session_cookie(response, str(user["_id"]))
    return {"user": public_user(user)}


@app.post("/api/auth/login")
def login(credentials: Credentials, request: Request, response: Response, database: Database):
    check_auth_rate_limit(request.client.host if request.client else "unknown")
    user = database.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("passwordHash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
        )

    set_session_cookie(response, str(user["_id"]))
    return {"user": public_user(user)}


@app.get("/api/auth/me")
def get_me(user: CurrentUser):
    return {"user": public_user(user)}


@app.post("/api/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    response.delete_cookie(
        SESSION_COOKIE,
        path="/",
        httponly=True,
        secure=os.getenv("APP_ENV", "development").lower() == "production",
        samesite="strict",
    )


@app.get("/api/assignments")
def list_assignments(user: CurrentUser, database: Database):
    role = user.get("role", "student")
    if role == "director":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Use the director reports page to view learning summaries.",
        )
    query = {"owner": user["_id"]} if role == "student" else {}
    assignments = database.assignments.find(
        query,
        {
            "title": 1,
            "subject": 1,
            "dueDate": 1,
            "completed": 1,
            "status": 1,
            "submissionNote": 1,
            "feedback": 1,
            "owner": 1,
        },
    ).sort([("completed", ASCENDING), ("dueDate", ASCENDING)])
    result = []
    for assignment in assignments:
        item = public_assignment(assignment)
        if role in STAFF_ROLES:
            student = database.users.find_one(
                {"_id": assignment["owner"]}, {"email": 1}
            )
            item["studentEmail"] = student["email"] if student else "Unknown student"
        result.append(item)
    return {"assignments": result}


@app.post("/api/assignments", status_code=status.HTTP_201_CREATED)
def create_assignment(data: AssignmentCreate, user: CurrentUser, database: Database):
    role = user.get("role", "student")
    if role not in ("student", *STAFF_ROLES):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Directors have read-only access.",
        )

    if role == "student":
        if data.studentId is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students can only create assignments for their own workspace.",
            )
        student_id = user["_id"]
    else:
        from bson import ObjectId

        if not data.studentId or not ObjectId.is_valid(data.studentId):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Choose a student for this assignment.",
            )
        student_id = ObjectId(data.studentId)
        student = database.users.find_one(
            {"_id": student_id, "role": "student"}, {"_id": 1}
        )
        if not student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected student account was not found.",
            )

    assignment = {
        "owner": student_id,
        "createdBy": user["_id"],
        "title": data.title,
        "subject": data.subject,
        "dueDate": data.dueDate,
        "status": "pending",
        "completed": False,
        "createdAt": datetime.now(timezone.utc),
    }
    inserted = database.assignments.insert_one(assignment)
    assignment["_id"] = inserted.inserted_id
    return {"assignment": public_assignment(assignment)}


@app.patch("/api/assignments/{assignment_id}")
def submit_assignment(
    assignment_id: str,
    data: AssignmentSubmission,
    user: CurrentUser,
    database: Database,
):
    from bson import ObjectId
    from pymongo import ReturnDocument

    if user.get("role", "student") != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit their own work for review.",
        )
    if not ObjectId.is_valid(assignment_id):
        raise HTTPException(status_code=404, detail="Assignment not found.")

    assignment = database.assignments.find_one_and_update(
        {
            "_id": ObjectId(assignment_id),
            "owner": user["_id"],
            "$or": [
                {"status": "pending"},
                {"status": "revision_requested"},
                {"status": {"$exists": False}, "completed": False},
            ],
        },
        {
            "$set": {
                "status": "submitted",
                "completed": False,
                "submissionNote": data.submissionNote,
                "submittedAt": datetime.now(timezone.utc),
            },
            "$unset": {"feedback": ""},
        },
        return_document=ReturnDocument.AFTER,
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This assignment is not available to submit. It may already be awaiting review or approved.",
        )
    return {"assignment": public_assignment(assignment)}


@app.post("/api/assignments/{assignment_id}/review")
def review_assignment(
    assignment_id: str,
    data: AssignmentReview,
    user: CurrentUser,
    database: Database,
):
    from bson import ObjectId
    from pymongo import ReturnDocument

    require_staff(user)
    if not ObjectId.is_valid(assignment_id):
        raise HTTPException(status_code=404, detail="Assignment not found.")

    assignment = database.assignments.find_one_and_update(
        {
            "_id": ObjectId(assignment_id),
            "$or": [
                {"status": "submitted"},
                {"status": {"$exists": False}, "completed": True},
            ],
        },
        {
            "$set": {
                "status": data.decision,
                "completed": data.decision == "approved",
                "feedback": data.feedback,
                "reviewedBy": user["_id"],
                "reviewedAt": datetime.now(timezone.utc),
            }
        },
        return_document=ReturnDocument.AFTER,
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only submitted assignments can be reviewed.",
        )

    student = database.users.find_one({"_id": assignment["owner"]}, {"email": 1})
    result = public_assignment(assignment)
    result["studentEmail"] = student["email"] if student else "Unknown student"
    return {"assignment": result}


@app.delete("/api/assignments/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_assignment(assignment_id: str, user: CurrentUser, database: Database):
    from bson import ObjectId

    require_admin(user)
    if not ObjectId.is_valid(assignment_id):
        raise HTTPException(status_code=404, detail="Assignment not found.")

    result = database.assignments.delete_one({"_id": ObjectId(assignment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found.")


@app.get("/api/students")
def list_students(user: CurrentUser, database: Database):
    require_staff(user)
    students = database.users.find({"role": "student"}, {"email": 1}).sort(
        "email", ASCENDING
    )
    return {
        "students": [
            {"id": str(student["_id"]), "email": student["email"]}
            for student in students
        ]
    }


@app.get("/api/students/progress")
def student_subject_progress(user: CurrentUser, database: Database):
    require_staff(user)

    students = list(
        database.users.find({"role": "student"}, {"email": 1}).sort(
            "email", ASCENDING
        )
    )
    grouped_assignments = database.assignments.aggregate(
        [
            {
                "$set": {
                    "progressStatus": {
                        "$ifNull": [
                            "$status",
                            {
                                "$cond": [
                                    {"$eq": ["$completed", True]},
                                    "submitted",
                                    "pending",
                                ]
                            },
                        ]
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "owner": "$owner",
                        "subject": "$subject",
                        "status": "$progressStatus",
                    },
                    "count": {"$sum": 1},
                }
            },
        ]
    )
    counts_by_student: dict[object, dict[str, dict[str, int]]] = {}
    for item in grouped_assignments:
        owner_id = item["_id"]["owner"]
        subject = item["_id"]["subject"]
        assignment_status = item["_id"]["status"]
        subject_counts = counts_by_student.setdefault(owner_id, {}).setdefault(
            subject,
            {
                "total": 0,
                "pending": 0,
                "submitted": 0,
                "approved": 0,
                "revision_requested": 0,
            },
        )
        subject_counts["total"] += item["count"]
        if assignment_status in subject_counts:
            subject_counts[assignment_status] += item["count"]

    result = []
    for student in students:
        subject_results = []
        student_counts = counts_by_student.get(student["_id"], {})
        for subject in SUBJECTS:
            counts = student_counts.get(
                subject,
                {
                    "total": 0,
                    "pending": 0,
                    "submitted": 0,
                    "approved": 0,
                    "revision_requested": 0,
                },
            )
            if counts["total"] == 0:
                subject_status = "not_assigned"
            elif counts["pending"] > 0:
                subject_status = "not_done"
            elif counts["revision_requested"] > 0:
                subject_status = "changes_requested"
            elif counts["submitted"] > 0:
                subject_status = "awaiting_review"
            else:
                subject_status = "done"
            subject_results.append(
                {"subject": subject, "status": subject_status, **counts}
            )
        result.append(
            {
                "studentId": str(student["_id"]),
                "email": student["email"],
                "subjects": subject_results,
            }
        )

    return {"students": result, "subjects": list(SUBJECTS)}


@app.get("/api/users")
def list_users(user: CurrentUser, database: Database):
    require_admin(user)
    users = database.users.find({}, {"email": 1, "role": 1}).sort("email", ASCENDING)
    return {
        "users": [
            {
                "id": str(account["_id"]),
                "email": account["email"],
                "role": account.get("role", "student"),
            }
            for account in users
        ]
    }


@app.patch("/api/users/{user_id}/role")
def update_user_role(
    user_id: str,
    data: RoleUpdate,
    user: CurrentUser,
    database: Database,
):
    from bson import ObjectId

    require_admin(user)
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=404, detail="Account not found.")
    target_id = ObjectId(user_id)
    if target_id == user["_id"] and data.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own administrator access.",
        )

    target = database.users.find_one({"_id": target_id}, {"role": 1, "email": 1})
    if not target:
        raise HTTPException(status_code=404, detail="Account not found.")
    if target.get("role", "student") == "admin" and data.role != "admin":
        admin_count = database.users.count_documents({"role": "admin"})
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="The last administrator cannot be demoted.",
            )

    database.users.update_one({"_id": target_id}, {"$set": {"role": data.role}})
    return {
        "user": {
            "id": str(target_id),
            "email": target["email"],
            "role": data.role,
        }
    }


@app.get("/api/director/overview")
def director_overview(user: CurrentUser, database: Database):
    if user.get("role", "student") not in ("director", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Director or administrator access is required.",
        )

    students = database.users.count_documents({"role": "student"})
    totals = {
        "total": database.assignments.count_documents({}),
        "pending": database.assignments.count_documents(
            {"$or": [{"status": "pending"}, {"status": {"$exists": False}, "completed": False}]}
        ),
        "submitted": database.assignments.count_documents(
            {
                "$or": [
                    {"status": "submitted"},
                    {"status": {"$exists": False}, "completed": True},
                ]
            }
        ),
        "approved": database.assignments.count_documents({"status": "approved"}),
        "revisionRequested": database.assignments.count_documents(
            {"status": "revision_requested"}
        ),
    }
    by_subject = list(
        database.assignments.aggregate(
            [
                {"$group": {"_id": "$subject", "count": {"$sum": 1}}},
                {"$sort": {"count": -1, "_id": 1}},
            ]
        )
    )
    return {
        "students": students,
        "assignments": totals,
        "bySubject": [
            {"subject": item["_id"], "count": item["count"]}
            for item in by_subject
        ],
    }


STATIC_DIRECTORY = ROOT / "static"
if STATIC_DIRECTORY.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIRECTORY, html=True), name="frontend")
else:
    @app.get("/")
    def frontend_not_built():
        return FileResponse(ROOT / "index.html")
