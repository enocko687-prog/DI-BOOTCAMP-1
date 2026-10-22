# Studyspace Assignment Tracker

A golden-blue, responsive assignment dashboard built with React and JavaScript. A Python FastAPI backend provides private student accounts and stores assignment data in MongoDB.

## Showcase demo

Click **Try the interactive demo** on the home page to explore the student, teacher, administrator, and director portals without configuring a database. Use the **View as** selector in the demo banner to switch roles. The sample workflow supports submitting individual assignments, reviewing or returning work with feedback, subject progress, reports, and account-role management. Demo data is stored only in that browser's local storage; use **Reset demo data** to restore the starting examples.

The demo is for showcasing the interface and workflow. It is not an authentication system and must not be used for real student records. Real accounts and persistent shared data use the FastAPI and MongoDB service described below.

## Requirements

- Node.js 20.19 or newer
- Python 3.10 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Configure

1. Install frontend dependencies:

   ```powershell
   npm install
   ```

2. Create and activate a Python virtual environment:

   ```powershell
   py -m venv .venv
   .venv\Scripts\Activate.ps1
   ```

3. Install backend dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env`.
5. Set `MONGODB_URI` to your database connection string.
6. Generate a session secret and place it in `.env`:

   ```powershell
   python -c "import secrets; print(secrets.token_hex(48))"
   ```

7. Set a strong, separate value for `ADMIN_INVITE_CODE`. Use that code to create the first administrator account. Set `TEACHER_INVITE_CODE` and `DIRECTOR_INVITE_CODE` if those roles should be able to register themselves. Keep all invitation codes private. An administrator can later change account roles in **People & access**.

## Run for development

Open two PowerShell terminals from the project folder:

```powershell
# Terminal 1: Python API
uvicorn app.main:app --reload --port 8000
```

```powershell
# Terminal 2: React + Vite
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The home-page demo also runs from a static build and is suitable for GitHub Pages. To publish, build with `npm run build` and publish the generated `static/` directory. Static hosting provides the local-only showcase demo; configure and host the Python API and MongoDB separately for real accounts and shared persistent data.

## Build and serve

```powershell
npm run build
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000`. The Python API serves the React build from `static/`.

For deployment, set `APP_ENV=production`, configure `APP_ORIGIN` to the public HTTPS origin, set `MONGODB_URI`, and generate a unique `SESSION_SECRET`. Use HTTPS and a production MongoDB service.

## Run tests

```powershell
python -m unittest discover -s tests -v
```

## API routes

Public account routes:

- `POST /api/auth/register` — create a student account, or create a staff account with the matching invitation code
- `POST /api/auth/login` — sign in

Authenticated account routes:

- `GET /api/auth/me` — return the signed-in account
- `POST /api/auth/logout` — sign out
- `GET /api/health` — check API health

Student routes:

- `GET /api/assignments` — list only the signed-in student's own assignments
- `POST /api/assignments` — add work to the student's workspace
- `PATCH /api/assignments/{id}` — submit work for teacher review; students cannot approve work

Teacher and administrator routes:

- `GET /api/assignments` — view student work and review status
- `GET /api/students` — choose a student when creating an assignment
- `GET /api/students/progress` — view each student's status and assignment counts across every subject
- `POST /api/assignments` — assign work to a student
- `POST /api/assignments/{id}/review` — approve a submission or request changes with feedback

Director and administrator reports:

- `GET /api/director/overview` — read-only school-wide totals and subject activity

Administrator-only routes:

- `GET /api/users` — list accounts and access roles
- `PATCH /api/users/{id}/role` — manage account roles
- `DELETE /api/assignments/{id}` — remove an assignment

Student and staff assignment lists are grouped under separate subject headings, while submissions remain individual per assignment. When a student submits work, signed-in teachers and administrators see an in-app alert on their next refresh (checked every 15 seconds) and the review-queue count updates; staff can open the review queue directly from the alert. The teacher and administrator portals also include a student-by-subject progress table. It distinguishes approved work, work not yet submitted, submissions awaiting review, requested changes, and subjects without assignments. Directors see aggregate reports only. Session tokens use HTTP-only, same-site cookies. Passwords are stored as salted PBKDF2-SHA256 hashes. Role checks and assignment ownership are enforced by the Python API, not only by hiding controls in the interface. Assignment states are `pending`, `submitted`, `approved`, and `revision_requested`; only a teacher or administrator can approve submitted work. Legacy completion flags are treated as submitted so they receive staff review under the current workflow.
