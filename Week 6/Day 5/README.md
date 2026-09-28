# Week 6 - Day 5: Express CRUD API Projects

This folder contains three small Express.js projects completed for Day 5 of Week 6.

## Projects

### 1. Blog API
Location: `blog-api`

This API simulates a blog platform and includes:
- `GET /posts` to read all blog posts
- `GET /posts/:id` to read one blog post by ID
- `POST /posts` to create a new blog post
- `PUT /posts/:id` to update an existing post
- `DELETE /posts/:id` to delete a post
- Error handling for invalid routes and server issues

Run it:
```bash
cd blog-api
npm start
```

### 2. Book API
Location: `book-api`

This API manages a collection of books and includes:
- `GET /api/books` to read all books
- `GET /api/books/:bookId` to read a single book
- `POST /api/books` to add a new book

Run it:
```bash
cd book-api
npm start
```

### 3. CRUD API with Axios
Location: `crud-api`

This project fetches blog posts from the JSONPlaceholder API using Axios and exposes them through a local API route:
- `GET /posts`

Run it:
```bash
cd crud-api
npm start
```

## Notes
- The blog API listens on port `3000`.
- The book API and CRUD API listen on port `5000`.
- All apps were verified to return successful HTTP responses during testing.
