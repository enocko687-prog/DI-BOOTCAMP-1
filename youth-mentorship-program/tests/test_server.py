import json
import tempfile
import threading
import unittest
from datetime import timedelta
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import server


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.original_database_path = server.DATABASE_PATH
        server.DATABASE_PATH = Path(self.temporary_directory.name) / "test.sqlite3"
        server.initialize_database()
        server.ACTIVE_SESSIONS.clear()
        server.LOGIN_FAILURES.clear()
        self.cookie = ""
        self.csrf_token = ""
        self.httpd = server.ThreadingHTTPServer(
            ("127.0.0.1", 0), server.MentorshipHandler
        )
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self.thread.start()
        self.base_url = f"http://127.0.0.1:{self.httpd.server_port}"

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.thread.join()
        server.DATABASE_PATH = self.original_database_path
        self.temporary_directory.cleanup()

    def request(self, method, path, payload=None, *, authenticated=True):
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        headers = {"Content-Type": "application/json"} if body is not None else {}
        if authenticated and self.cookie:
            headers["Cookie"] = self.cookie
        if (
            authenticated
            and self.csrf_token
            and method in {"POST", "PUT", "PATCH", "DELETE"}
            and path not in {"/api/auth/setup", "/api/auth/login"}
        ):
            headers["X-CSRF-Token"] = self.csrf_token
        request = Request(
            self.base_url + path,
            data=body,
            headers=headers,
            method=method,
        )
        try:
            with urlopen(request) as response:
                self.capture_auth(response)
                return response.status, json.loads(response.read())
        except HTTPError as error:
            with error:
                self.capture_auth(error)
                return error.code, json.loads(error.read())

    def capture_auth(self, response):
        cookie = response.headers.get("Set-Cookie")
        if cookie:
            self.cookie = cookie.split(";", 1)[0]

    def create_account(self):
        status, result = self.request(
            "POST",
            "/api/auth/setup",
            {
                "username": "test.admin",
                "password": "correct horse battery",
                "confirmPassword": "correct horse battery",
            },
            authenticated=False,
        )
        self.assertEqual(status, 201)
        self.csrf_token = result["csrfToken"]
        return result

    def test_records_export_and_import_round_trip(self):
        self.create_account()
        status, request_record = self.request(
            "POST",
            "/api/requests",
            {
                "groupType": "Community",
                "groupName": "Sample group",
                "ageGroup": "Teenagers (13–17)",
                "topic": "Confidence and self-esteem",
                "support": "General confidence-building support",
                "mentorTopic": "",
            },
        )
        self.assertEqual(status, 201)
        self.assertEqual(request_record["id"], 1)
        self.assertEqual(
            self.request(
                "PATCH",
                f"/api/requests/{request_record['id']}",
                {"mentorTopic": "Financial literacy"},
            )[0],
            200,
        )

        status, session_record = self.request(
            "POST",
            "/api/sessions",
            {
                "date": "2026-10-01",
                "topic": "Goal setting",
                "attendance": 12,
                "status": "completed",
                "progress": "On track",
                "followUpDate": "",
                "summary": "General group discussion",
            },
        )
        self.assertEqual(status, 201)
        self.assertEqual(session_record["attendance"], 12)

        schedule = [
            {
                "id": 1,
                "date": "2026-11-07",
                "topic": "Orientation",
                "focus": "Group agreements and program overview",
                "startTime": "14:00",
                "endTime": "16:00",
            }
        ]
        self.assertEqual(self.request("PUT", "/api/schedule", schedule)[0], 200)

        status, backup = self.request("GET", "/api/export")
        self.assertEqual(status, 200)
        self.assertEqual(backup["schemaVersion"], 2)
        self.assertEqual(backup["requests"][0]["mentorTopic"], "Financial literacy")
        self.assertEqual(len(backup["sessions"]), 1)
        self.assertEqual(backup["schedule"][0]["topic"], "Orientation")
        self.assertEqual(backup["mentorPlans"], [])
        self.assertEqual(backup["bookings"], [])

        self.assertEqual(self.request("POST", "/api/import", backup)[0], 200)
        self.assertEqual(len(self.request("GET", "/api/requests")[1]), 1)
        imported_sessions = self.request("GET", "/api/sessions")[1]
        self.assertEqual(len(imported_sessions), 1)
        self.assertEqual(len(self.request("GET", "/api/schedule")[1]["records"]), 1)
        self.assertEqual(
            self.request("DELETE", f"/api/sessions/{imported_sessions[0]['id']}")[0],
            200,
        )

    def test_public_mentor_directory_booking_and_capacity(self):
        self.create_account()
        session_date = (
            server.datetime.now(
                server.timezone(server.timedelta(hours=3))
            ).date()
            + timedelta(days=1)
        ).isoformat()
        plan = {
            "mentorName": "Sample Mentor",
            "specialty": "Career guidance",
            "topics": "Education and career planning",
            "bio": "Supports young people with practical career goals.",
            "sessionDate": session_date,
            "sessionTopic": "Career next steps",
            "focus": "Explore strengths and choose a practical next step.",
            "startTime": "14:00",
            "endTime": "15:00",
            "capacity": 2,
        }
        self.assertEqual(
            self.request(
                "POST",
                "/api/mentors",
                plan,
                authenticated=False,
            )[0],
            401,
        )
        status, saved_plan = self.request("POST", "/api/mentors", plan)
        self.assertEqual(status, 201)
        self.assertEqual(
            self.request("GET", "/api/mentors", authenticated=False)[1][0]["available"],
            2,
        )

        status, booking = self.request(
            "POST",
            "/api/bookings",
            {
                "planId": saved_plan["id"],
                "attendeeAlias": "Group Cedar",
                "attendeeCount": 2,
            },
            authenticated=False,
        )
        self.assertEqual(status, 201)
        self.assertEqual(booking["attendeeCount"], 2)
        self.assertEqual(
            self.request("GET", "/api/mentors", authenticated=False)[1][0]["available"],
            0,
        )
        self.assertEqual(
            self.request(
                "POST",
                "/api/bookings",
                {
                    "planId": saved_plan["id"],
                    "attendeeAlias": "Another group",
                    "attendeeCount": 1,
                },
                authenticated=False,
            )[0],
            409,
        )
        self.assertEqual(
            self.request("GET", "/api/bookings", authenticated=False)[0],
            401,
        )
        status, bookings = self.request("GET", "/api/bookings")
        self.assertEqual(status, 200)
        self.assertEqual(bookings[0]["attendeeAlias"], "Group Cedar")

        status, backup = self.request("GET", "/api/export")
        self.assertEqual(status, 200)
        self.assertEqual(len(backup["mentorPlans"]), 1)
        self.assertEqual(len(backup["bookings"]), 1)
        self.assertEqual(self.request("POST", "/api/import", backup)[0], 200)
        self.assertEqual(
            self.request("GET", "/api/mentors", authenticated=False)[1][0]["available"],
            0,
        )

    def test_invalid_import_does_not_replace_existing_records(self):
        self.create_account()
        self.request(
            "POST",
            "/api/requests",
            {
                "groupType": "Community",
                "groupName": "",
                "ageGroup": "Teenagers (13–17)",
                "topic": "Confidence and self-esteem",
                "support": "Sample support",
                "mentorTopic": "",
            },
        )
        status, result = self.request(
            "POST",
            "/api/import",
            {
                "schemaVersion": 1,
                "requests": [{"groupType": []}],
                "sessions": [],
                "schedule": [],
            },
        )
        self.assertEqual(status, 400)
        self.assertIn("groupType", result["error"])
        self.assertEqual(len(self.request("GET", "/api/requests")[1]), 1)

    def test_account_setup_login_logout_and_api_protection(self):
        status, setup_status = self.request(
            "GET", "/api/auth/status", authenticated=False
        )
        self.assertEqual(status, 200)
        self.assertTrue(setup_status["setupRequired"])
        self.assertEqual(
            self.request("GET", "/api/requests", authenticated=False)[0], 401
        )

        result = self.create_account()
        self.assertEqual(result["username"], "test.admin")
        self.assertEqual(
            self.request("GET", "/api/auth/status")[1]["authenticated"], True
        )

        with server.connect_database() as connection:
            password_hash = connection.execute(
                "SELECT password_hash FROM local_admin WHERE id = 1"
            ).fetchone()["password_hash"]
        self.assertNotEqual(password_hash, "correct horse battery")

        self.assertEqual(
            self.request(
                "POST",
                "/api/requests",
                {},
                authenticated=False,
            )[0],
            401,
        )

        self.assertEqual(
            self.request(
                "POST",
                "/api/auth/logout",
                {},
                authenticated=True,
            )[0],
            200,
        )
        self.cookie = ""
        self.csrf_token = ""
        self.assertEqual(
            self.request("GET", "/api/requests", authenticated=False)[0], 401
        )
        self.assertEqual(
            self.request(
                "POST",
                "/api/auth/login",
                {"username": "test.admin", "password": "incorrect password"},
                authenticated=False,
            )[0],
            401,
        )
        status, login_result = self.request(
            "POST",
            "/api/auth/login",
            {"username": "test.admin", "password": "correct horse battery"},
            authenticated=False,
        )
        self.assertEqual(status, 200)
        self.csrf_token = login_result["csrfToken"]
        self.assertEqual(
            self.request("GET", "/api/requests")[0], 200
        )

    def test_mutations_require_csrf_token(self):
        self.create_account()
        token = self.csrf_token
        self.csrf_token = ""
        status, result = self.request(
            "POST",
            "/api/requests",
            {
                "groupType": "Community",
                "groupName": "",
                "ageGroup": "Teenagers (13–17)",
                "topic": "Confidence and self-esteem",
                "support": "Sample support",
                "mentorTopic": "",
            },
        )
        self.assertEqual(status, 403)
        self.assertIn("verified", result["error"])
        self.csrf_token = token
        self.assertEqual(len(self.request("GET", "/api/requests")[1]), 0)


if __name__ == "__main__":
    unittest.main()
