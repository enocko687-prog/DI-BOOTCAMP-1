# JWT Authentication API

## Start the server

1. Install Node.js 20 or newer.
2. Open this folder in a terminal and run `npm install`.
3. Copy `.env.example` to `.env`; set two different random secrets, each at least 32 characters long.
4. Run `npm run dev` for development or `npm start` to start the server.

The API listens on `http://localhost:3000` by default. Set `PORT` in `.env` to use a different port. Use HTTPS and set `NODE_ENV=production` when deploying.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register and sign in with `{"username":"student_1","password":"a-long-password"}` |
| POST | `/api/auth/login` | Sign in with the same JSON body |
| POST | `/api/auth/refresh` | Rotate the refresh cookie and issue a new access cookie |
| POST | `/api/auth/logout` | Revoke the refresh session and clear authentication cookies |
| GET | `/api/auth/me` | Get the signed-in user's profile |
| PATCH | `/api/users/me` | Update the profile with `{"displayName":"Student"}` |

Tokens use separate secrets and HS256 signatures. Access tokens expire after 15 minutes; refresh tokens expire after 7 days. Both are stored in `httpOnly`, `sameSite=strict` cookies. Login/registration and refresh endpoints are rate limited.

User accounts and refresh sessions are stored in memory for this learning exercise, so they reset when the server restarts. For a real deployment, use a database and persistent hashed refresh-token records. Cookie authentication should also be paired with an appropriate CSRF strategy when the API is deployed across origins.
