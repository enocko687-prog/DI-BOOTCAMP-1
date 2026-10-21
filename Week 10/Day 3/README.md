# JWT Authentication API

## Run locally

1. Install Node.js 20 or newer.
2. In this folder, install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and replace both JWT secrets with different random values, each at least 32 characters long.
4. Start the API with `npm run dev` or `npm start`.

The server listens on `http://localhost:3000` by default. Set `PORT` in `.env` to change it. Use HTTPS and set `NODE_ENV=production` when deploying.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register and sign in. Body: `{"username":"student_1","password":"a-long-password"}` |
| POST | `/api/auth/login` | Sign in with the same body shape |
| POST | `/api/auth/refresh` | Rotate the refresh token and issue a new access token |
| POST | `/api/auth/logout` | Revoke the current refresh session and clear cookies |
| GET | `/api/auth/me` | Return the signed-in user's profile |
| PATCH | `/api/users/me` | Update profile. Body: `{"displayName":"Student"}` |

Access and refresh tokens are stored in `httpOnly`, `sameSite=strict` cookies. The access token lasts 15 minutes and the refresh token lasts 7 days. Login, registration, and refresh are rate limited.

This learning example stores users and refresh sessions in memory; they are cleared when the process restarts. Use a database and persistent, hashed refresh-token records for production.
