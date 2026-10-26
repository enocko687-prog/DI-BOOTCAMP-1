# Mentorship for As We Move Upward and Forward

This is a local-only demo backed by Python's standard-library HTTP server and
SQLite. The existing HTML, CSS, and JavaScript page uses a JSON API for
mentorship requests, group-level tracker entries, the program schedule,
mentor session plans, and bookings. Visitors can browse upcoming mentor plans
and reserve places; the signed-in local account can publish plans and view the
booking dashboard. You can back up or restore these collections as JSON.

## Run locally

1. Install Python 3.9 or newer if it is not already installed.
2. Double-click `start-local.bat`, or open a terminal in this folder and run
   `python server.py`.
3. The app opens in your browser at <http://localhost:8000>.
4. The public landing page opens first. Select **Login** or **Get Started** to
   create a username and password with at least 12 characters on first launch,
   or to sign in on later visits.
5. Keep the server window open while using the app; stop it with Ctrl+C.

The server listens only on the computer's IPv4 and IPv6 localhost interfaces;
the database file
`mentorship.sqlite3` is created in this folder. No third-party Python packages
are required. Do not open `index.html` directly with `file://`; the page needs
the local API. The login account is stored in this database; its password is
stored as a salted PBKDF2 hash. Login sessions expire after eight hours and are
cleared when the server stops. There is no password recovery. If you forget
your password, stop the server and remove `mentorship.sqlite3` to create a new
account; this also permanently deletes all stored program data.

## Run tests

Run `python -m unittest discover -s tests -v` from the project folder.

## JSON API

- `GET /api/health` — local server status
- `GET /api/auth/status` — account setup and login status
- `POST /api/auth/setup` — create the one-time local administrator
- `POST /api/auth/login` — authenticate and start a session
- `POST /api/auth/logout` — end the current session
- `GET, POST /api/requests` — list or create mentorship requests
- `PATCH /api/requests/{id}` — set a request's mentor discussion topic
- `GET, POST /api/sessions` — list or create tracker entries
- `DELETE /api/sessions/{id}` — delete a tracker entry
- `GET, PUT /api/schedule` — read or replace scheduled sessions
- `GET /api/mentors` — publicly browse mentor plans and remaining places
- `POST /api/mentors` — publish a mentor plan (sign-in required)
- `DELETE /api/mentors/{id}` — remove a mentor plan and its bookings (sign-in required)
- `POST /api/bookings` — publicly reserve places in an upcoming mentor session
- `GET /api/bookings` — view session bookings (sign-in required)
- `GET /api/export` — download a versioned JSON backup
- `POST /api/import` — validate and atomically replace data from a backup

The export endpoint creates JSON backups with `schemaVersion: 2` and the
`requests`, `sessions`, `schedule`, `mentorPlans`, and `bookings` arrays.
Version 1 backups are still accepted. Import replaces all current records.

## Privacy and intended use

The local account gates management API access; mentor browsing and booking are
public. This demo does not encrypt its database or protect files from someone
with access to this computer. Use only fictional or non-identifying sample
data. Booking names should be first names or group aliases only; do not collect
contact details, case notes, or sensitive information about young people. This
is a single-computer demo: mentors share one local administrator account and
data does not sync between devices. Do not expose this server to a network or
deploy it for production use.
