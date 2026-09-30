# User Management API

Express registration and login backed by `data/users.json`, with bcrypt password hashes and separate login/register pages.

## Run

From this folder:

```powershell
npm install
npm start
```

Open `http://localhost:3003/login.html` or `http://localhost:3003/register.html`. The selected Day 3 starter also runs the API when started from the `Week 7/Day 3` folder: `node "Daily challange task API.js"`.

## Routes

- `POST /register` accepts `name`, `lastName`, `email`, `username`, and `password`.
- `POST /login` accepts `username` and `password`.
- `GET /users` lists public user details.
- `GET /users/:id` retrieves public details for one user.
- `PUT /users/:id` updates one or more of `name`, `lastName`, `email`, `username`, or `password`.

Passwords are bcrypt-hashed before storage and are never returned by the API. Duplicate usernames, email addresses, or passwords are rejected. User routes are intentionally unauthenticated for this exercise. Data and accounts are local to this server; use a database and proper access controls for a production system.

## Test

```powershell
npm test
```