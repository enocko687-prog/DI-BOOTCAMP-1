import unittest
from unittest.mock import Mock

from bson import ObjectId

from fastapi import HTTPException
from pydantic import ValidationError

from app.main import (
    AUTH_LIMIT,
    AUTH_WINDOW_SECONDS,
    AssignmentCreate,
    AssignmentReview,
    AssignmentSubmission,
    app,
    auth_attempts,
    check_auth_rate_limit,
    hash_password,
    list_assignments,
    public_assignment,
    require_admin,
    require_staff,
    review_assignment,
    SUBJECTS,
    student_subject_progress,
    validate_email,
    verify_password,
)


class AccountValidationTests(unittest.TestCase):
    def test_email_is_normalized(self):
        self.assertEqual(validate_email("  STUDENT@example.com "), "student@example.com")

    def test_invalid_email_is_rejected(self):
        with self.assertRaises(ValueError):
            validate_email("not-an-email")

    def test_password_hash_verifies_without_storing_plaintext(self):
        password = "a long password for the student"
        encoded = hash_password(password)
        self.assertTrue(verify_password(password, encoded))
        self.assertFalse(verify_password("wrong password", encoded))
        self.assertNotIn(password, encoded)

    def test_assignment_input_trims_title_and_validates_calendar_date(self):
        assignment = AssignmentCreate(
            title="  Chapter 4  ",
            subject="Science",
            dueDate="2026-10-30",
        )
        self.assertEqual(assignment.title, "Chapter 4")

        with self.assertRaises(ValidationError):
            AssignmentCreate(
                title="Chapter 4",
                subject="Science",
                dueDate="2026-02-30",
            )

    def test_sign_in_attempts_are_limited_then_expire(self):
        client_ip = "test-limit-client"
        auth_attempts.pop(client_ip, None)
        for attempt in range(AUTH_LIMIT):
            check_auth_rate_limit(client_ip, now=1000 + attempt)

        with self.assertRaises(HTTPException) as error:
            check_auth_rate_limit(client_ip, now=1000 + AUTH_LIMIT)
        self.assertEqual(error.exception.status_code, 429)

        check_auth_rate_limit(
            client_ip,
            now=1000 + AUTH_WINDOW_SECONDS + AUTH_LIMIT + 1,
        )
        auth_attempts.pop(client_ip, None)

    def test_api_exposes_expected_public_and_protected_routes(self):
        paths = app.openapi()["paths"]
        self.assertIn("/api/auth/register", paths)
        self.assertIn("/api/auth/login", paths)
        self.assertIn("/api/assignments", paths)
        self.assertIn("/api/assignments/{assignment_id}", paths)
        self.assertIn("/api/assignments/{assignment_id}/review", paths)
        self.assertIn("/api/director/overview", paths)
        self.assertIn("/api/students/progress", paths)

    def test_only_teacher_and_admin_roles_can_review(self):
        require_staff({"role": "teacher"})
        require_staff({"role": "admin"})
        for role in ("student", "director"):
            with self.subTest(role=role), self.assertRaises(HTTPException) as error:
                require_staff({"role": role})
            self.assertEqual(error.exception.status_code, 403)

    def test_only_admin_can_manage_privileged_pages(self):
        require_admin({"role": "admin"})
        for role in ("student", "teacher", "director"):
            with self.subTest(role=role), self.assertRaises(HTTPException) as error:
                require_admin({"role": role})
            self.assertEqual(error.exception.status_code, 403)

    def test_students_cannot_review_or_set_approval(self):
        task_id = str(ObjectId())
        with self.assertRaises(HTTPException) as error:
            review_assignment(
                task_id,
                AssignmentReview(decision="approved"),
                {"_id": ObjectId(), "role": "student"},
                Mock(),
            )
        self.assertEqual(error.exception.status_code, 403)

        with self.assertRaises(ValidationError):
            AssignmentSubmission.model_validate({"completed": True})

    def test_legacy_student_completion_requires_staff_review(self):
        legacy_assignment = {
            "_id": ObjectId(),
            "title": "Legacy task",
            "subject": "Mathematics",
            "dueDate": "2026-10-30",
            "completed": True,
        }
        result = public_assignment(legacy_assignment)
        self.assertEqual(result["status"], "submitted")
        self.assertFalse(result["completed"])

    def test_public_assignment_includes_submission_timestamp_for_staff_alerts(self):
        submitted_at = "2026-10-22T08:30:00+00:00"
        assignment = {
            "_id": ObjectId(),
            "title": "Reading response",
            "subject": "English",
            "dueDate": "2026-10-30",
            "status": "submitted",
            "submittedAt": submitted_at,
        }

        self.assertEqual(public_assignment(assignment)["submittedAt"], submitted_at)

    def test_directors_cannot_browse_student_assignments(self):
        with self.assertRaises(HTTPException) as error:
            list_assignments({"_id": ObjectId(), "role": "director"}, Mock())
        self.assertEqual(error.exception.status_code, 403)

    def test_student_subject_progress_includes_every_subject_and_assignment_state(self):
        student_id = ObjectId()
        database = Mock()
        database.users.find.return_value.sort.return_value = [
            {"_id": student_id, "email": "student@example.com"}
        ]
        database.assignments.aggregate.return_value = [
            {
                "_id": {
                    "owner": student_id,
                    "subject": "Mathematics",
                    "status": "approved",
                },
                "count": 2,
            },
            {
                "_id": {
                    "owner": student_id,
                    "subject": "English",
                    "status": "submitted",
                },
                "count": 1,
            },
            {
                "_id": {
                    "owner": student_id,
                    "subject": "Science",
                    "status": "pending",
                },
                "count": 1,
            },
        ]

        result = student_subject_progress(
            {"_id": ObjectId(), "role": "teacher"}, database
        )

        self.assertEqual(len(result["students"]), 1)
        subjects = {
            item["subject"]: item for item in result["students"][0]["subjects"]
        }
        self.assertEqual(set(subjects), set(SUBJECTS))
        self.assertEqual(subjects["Mathematics"]["status"], "done")
        self.assertEqual(subjects["Mathematics"]["approved"], 2)
        self.assertEqual(subjects["English"]["status"], "awaiting_review")
        self.assertEqual(subjects["Science"]["status"], "not_done")
        self.assertEqual(subjects["Kiswahili"]["status"], "not_assigned")

    def test_only_staff_can_view_student_subject_progress(self):
        for role in ("student", "director"):
            with self.subTest(role=role), self.assertRaises(HTTPException) as error:
                student_subject_progress({"role": role}, Mock())
            self.assertEqual(error.exception.status_code, 403)

    def test_review_action_only_targets_submitted_work(self):
        assignment_id = ObjectId()
        student_id = ObjectId()
        assignment = {
            "_id": assignment_id,
            "owner": student_id,
            "title": "Lab report",
            "subject": "Science",
            "dueDate": "2026-10-30",
            "status": "approved",
            "completed": True,
            "feedback": "Good work.",
            "submissionNote": "",
        }
        database = Mock()
        database.assignments.find_one_and_update.return_value = assignment
        database.users.find_one.return_value = {"email": "student@example.com"}

        result = review_assignment(
            str(assignment_id),
            AssignmentReview(decision="approved", feedback="Good work."),
            {"_id": ObjectId(), "role": "teacher"},
            database,
        )

        query = database.assignments.find_one_and_update.call_args.args[0]
        self.assertIn(
            {"status": "submitted"},
            query["$or"],
        )
        self.assertIn(
            {"status": {"$exists": False}, "completed": True},
            query["$or"],
        )
        self.assertEqual(result["assignment"]["status"], "approved")
        self.assertEqual(result["assignment"]["studentEmail"], "student@example.com")


if __name__ == "__main__":
    unittest.main()
