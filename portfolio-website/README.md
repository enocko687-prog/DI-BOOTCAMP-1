# Enock Brighton Portfolio

A responsive portfolio website with separate homepage, about, projects, and
contact pages, plus an Express API backed by SQL Server Express.

## Project layout

```text
frontend/                 Public website pages, CSS, and browser JavaScript
backend/                  Express server, API routes, and SQL connection
database/                 SQL Server schema and sample portfolio data
assets/images/            Profile image and project-image directory
assets/icons/             EB logo and social/contact SVG icons
PORTFOLIO-CONTENT-GUIDE.txt
BUILD-CHECKLIST.txt
enock-brighton-cv.txt
```

## Requirements

- Node.js (LTS recommended)
- Microsoft SQL Server Express with a database instance (default example:
  `SQLEXPRESS`)
- Microsoft ODBC Driver 18 for SQL Server (64-bit) for the Windows integrated
  authentication driver used by this project
- SQL Server Management Studio (SSMS) to run the database scripts
- On Windows integrated authentication, the Windows account running Node must
  have permission to access `EnockPortfolioDB`

The current development environment has Node.js, but no SQL Server service or
SQL Server ODBC Driver 17/18 was detected. The site and API can start without
the database, but
database-backed routes and saved contact messages will remain unavailable
until SQL Server Express is installed and configured. The contact form then
offers an email fallback if the API/database cannot save a submission.

## Set up the database

1. Install SQL Server Express and SSMS.
2. In SSMS, connect to your SQL Server Express instance.
3. Open and execute `database/portfolio.sql`.
4. Open and execute `database/sample-data.sql`.
5. In `backend/.env`, set the database server, instance, ODBC driver name, and authentication
   details. Start from `backend/.env.example`. The default settings use Windows
   integrated authentication. For SQL login authentication, set `DB_USER` and
   `DB_PASSWORD` to a properly secured SQL login.

The scripts create the `Projects`, `Skills`, `Experience`, and
`ContactMessages` tables. Sample rows are inserted only when the matching
project/experience or skill name is not already present.

## Install and run

In the VS Code terminal, from the project root:

```powershell
Copy-Item backend\.env.example backend\.env
Set-Location backend
npm install
npm run dev
```

If PowerShell says the env file already exists, keep your current settings.
Open **http://localhost:5000**. The server serves the frontend and API on the
same origin.

Useful endpoints:

- `http://localhost:5000/api/health`
- `http://localhost:5000/api/projects`
- `http://localhost:5000/api/skills`
- `http://localhost:5000/api/experience`

The message form sends JSON to `POST /api/contact`. The endpoint validates
input, limits contact submissions, and inserts values using SQL parameters.
It does not expose a route for reading private contact messages.

## Security and deployment notes

- Keep `backend/.env` and database passwords out of version control; the root
  `.gitignore` excludes the env file and installed packages.
- Use HTTPS and a least-privilege SQL account in production. Do not expose a
  private SQL Server instance directly to the public internet.
- The database connection is lazy: the HTTP server can start when SQL Server
  is unavailable, and `/api/health` reports that condition as `503 Offline`.
- GitHub Pages and other static-only hosts cannot run this Node API. Deploy the
  frontend and API to a Node-capable host and use a secured SQL Server host, or
  keep the static site and use its direct email/phone links.
- X and Instagram are not linked until personal profile URLs are supplied.
  Add those exact profile URLs before publishing; do not link platform homepages.
- Project descriptions and sample experience/skills should be reviewed for
  accuracy before publishing. No genuine project screenshots were supplied.

See `PORTFOLIO-CONTENT-GUIDE.txt` and `BUILD-CHECKLIST.txt` before launch.
