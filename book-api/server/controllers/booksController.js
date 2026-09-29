const books = require("../models/bookModel");

function parseId(value, res) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ error: "bookId must be a positive integer" });
    return null;
  }
  return id;
}

function validateBook(body, res, { requireAll = false } = {}) {
  const { title, author, publishedYear } = body || {};
  const supplied = [title, author, publishedYear].some((value) => value !== undefined);

  if (requireAll && (title === undefined || author === undefined || publishedYear === undefined)) {
    res.status(400).json({ error: "title, author, and publishedYear are required" });
    return null;
  }
  if (!requireAll && !supplied) {
    res.status(400).json({ error: "Provide at least one book field to update" });
    return null;
  }
  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    res.status(400).json({ error: "title must be a non-empty string" });
    return null;
  }
  if (author !== undefined && (typeof author !== "string" || !author.trim())) {
    res.status(400).json({ error: "author must be a non-empty string" });
    return null;
  }
  if (publishedYear !== undefined && !Number.isInteger(publishedYear)) {
    res.status(400).json({ error: "publishedYear must be an integer" });
    return null;
  }

  return {
    ...(title !== undefined ? { title: title.trim() } : {}),
    ...(author !== undefined ? { author: author.trim() } : {}),
    ...(publishedYear !== undefined ? { publishedYear } : {}),
  };
}

function listBooks(req, res) {
  res.json(books.findAll());
}

function getBook(req, res) {
  const id = parseId(req.params.bookId, res);
  if (id === null) return;
  const book = books.findById(id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.status(200).json(book);
}

function createBook(req, res) {
  const fields = validateBook(req.body, res, { requireAll: true });
  if (!fields) return;
  res.status(201).json(books.create(fields));
}

function updateBook(req, res) {
  const id = parseId(req.params.bookId, res);
  if (id === null) return;
  const fields = validateBook(req.body, res);
  if (!fields) return;
  const book = books.update(id, fields);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
}

function deleteBook(req, res) {
  const id = parseId(req.params.bookId, res);
  if (id === null) return;
  if (!books.remove(id)) return res.status(404).json({ error: "Book not found" });
  res.status(204).end();
}

module.exports = { listBooks, getBook, createBook, updateBook, deleteBook };
