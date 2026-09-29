# Book API

From this directory, run `npm install` and then `npm start`. The in-memory Express API listens on port 5000 by default (override with `PORT`). Data resets when the process restarts.

Endpoints: `GET /api/books`, `GET /api/books/:bookId`, `POST /api/books`, `PUT /api/books/:bookId`, and `DELETE /api/books/:bookId`. Create requests use JSON such as `{"title":"Dune","author":"Frank Herbert","publishedYear":1965}`.
