# StoryWeave — collaborative storytelling

StoryWeave is a TypeScript monorepo with an Express/PostgreSQL API and a Vite/React/Redux frontend. It supports account creation, sign-in, story creation and editing, contributors, comments, and saved story revisions.

## Requirements

- Node.js 20 or newer and npm
- PostgreSQL 14 or newer

## Local setup

1. Create a PostgreSQL database, for example `story_app`.
2. Copy `backend/.env.example` to `backend/.env`. Set `DATABASE_URL` and two different random JWT secrets of at least 32 characters.
3. Copy `frontend/.env.example` to `frontend/.env` if the API is not at its default local URL.
4. From this folder, install dependencies and initialize the database:

   ```sh
   npm install
   npm run db:init --workspace backend
   ```

5. Start the API and Vite frontend together:

   ```sh
   npm run dev
   ```

The frontend is at `http://localhost:5173`, the API at `http://localhost:4000`, and `GET /health` checks the API/database connection. Use `npm run typecheck`, `npm run build`, and `npm test --workspace backend` from this folder to validate the project.

## Features

- Register and sign in with email/password; passwords are hashed with bcrypt.
- Short-lived JWT access tokens stay in Redux memory. Authenticated requests include the access token in the standard authorization header.
- Refresh tokens are random, stored hashed in PostgreSQL, and sent only in an HTTP-only cookie. Startup restores the session; a failed authenticated request attempts refresh and retries once.
- Story CRUD, author-only deletion, author/contributor editing, contributor invitations by account email, and author-only contributor removal.
- Story comments and a version history that records the prior draft on each content change.
- Comment editing/deletion permissions, per-comment emoji reactions with optimistic UI, and author-controlled comment disabling.
- Authenticated Socket.IO story rooms; access tokens are checked on connection, only authors/contributors can join, and saved edits are broadcast live.
- Author-only version history and restore with a rollback snapshot, public share links, profile story lists, and Cloudinary avatar uploads.
- Responsive dashboard, “all/my stories” filters, dark/light theme switch, and validation/error states.
- Parameterized SQL queries, JSON input limits, rate-limited authentication, origin-checked refresh/logout endpoints, and generic server errors.

## API overview

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | HTTP-only refresh cookie |
| POST | `/api/auth/logout` | HTTP-only refresh cookie |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/auth/users/search?email=...` | Authenticated |
| GET / POST | `/api/stories` | Authenticated |
| GET / PATCH / DELETE | `/api/stories/:id` | Authenticated; role checks apply |
| GET / POST | `/api/stories/:id/comments` | Authenticated |
| GET | `/api/stories/:id/versions` | Authenticated |
| POST | `/api/contributors` | Authenticated; author only |
| GET | `/api/contributors/:story_id` | Authenticated |
| DELETE | `/api/contributors/:id` | Authenticated; story author only |
| POST | `/api/comments` | Authenticated |
| GET | `/api/comments/:story_id` | Authenticated |
| PATCH / DELETE | `/api/comments/:id` | Authenticated; author permissions apply |
| POST | `/api/comments/:id/reactions` | Authenticated |
| PATCH | `/api/stories/:id/comments` | Story author |
| POST | `/api/stories/:storyId/versions/:versionId/restore` | Story author |
| POST | `/api/stories/:id/share` | Authenticated |
| GET | `/api/share/:token` | Public share link |
| GET / PATCH | `/api/profile` | Authenticated |

For example, create a story with `{"title":"The old lighthouse","content":"The light blinked twice..."}`. Invite an existing user with `{"story_id":1,"user_id":2}`. API errors use JSON `{ "message": "..." }`.

The same routes are also available at the assignment's unprefixed paths (for example `POST /register`, `POST /login`, `GET /stories`, and `/contributors`) for direct API testing. The frontend uses the `/api`-prefixed routes.

## Environment variables

Backend values are documented in `backend/.env.example`:

- `PORT`: API port (default `4000`)
- `FRONTEND_URL`: exact allowed frontend origin (default `http://localhost:5173`)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET` and `REFRESH_SECRET`: different random secrets, each at least 32 characters
- `NODE_ENV`: set to `production` in production; refresh cookies then require HTTPS
- `PGSSL` and `PGSSL_REJECT_UNAUTHORIZED`: optional PostgreSQL SSL controls

Frontend `VITE_API_URL` is the base API URL including `/api`.
For avatar uploads, create a restricted unsigned image upload preset in Cloudinary and set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `frontend/.env`. The browser restricts avatars to images under 5 MB; the backend only stores the resulting HTTPS image URL. These are public upload configuration values, not API secrets.

## Deployment notes (Render)

Create a PostgreSQL service, a backend web service rooted at `Week 10/Day 5/backend`, and a frontend static site rooted at `Week 10/Day 5/frontend`. For the backend use `npm install && npm run build` as the build command and `npm start` as the start command. Run `npm run db:init` once from the backend service shell after setting `DATABASE_URL`, or use it as a one-time release command. Set `DATABASE_URL`, `JWT_SECRET`, `REFRESH_SECRET`, `FRONTEND_URL`, and `NODE_ENV=production` in the backend environment. For the frontend use `npm install && npm run build`, publish `dist`, and set `VITE_API_URL` to the deployed backend URL plus `/api` before building. Use HTTPS for both services and set `FRONTEND_URL` to the exact deployed frontend origin.

Never commit `.env` files or production secrets. Refresh-cookie authentication is configured for the separate frontend/backend origins used by Render and checks the request origin; keep `FRONTEND_URL` exact.
