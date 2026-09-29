# Blog API

Express REST API backed by PostgreSQL. From this directory, install dependencies with `npm install`.

1. Create the database (for example, `createdb postgres` if it does not exist) and apply `database.sql` using `psql -d postgres -f database.sql`.
2. Set `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD` in your environment as needed. Defaults are localhost:5432, database `postgres`, user `postgres`.
3. Start the API with `npm start` (port 3000 by default; override with `PORT`).

Endpoints: `GET /posts`, `GET /posts/:id`, `POST /posts`, `PUT /posts/:id`, and `DELETE /posts/:id`. Create requests use JSON such as `{"title":"Hello","content":"First post"}`.
