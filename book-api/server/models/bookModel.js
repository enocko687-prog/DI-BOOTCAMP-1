let nextId = 1;
const books = [];

function findAll() {
  return books;
}

function findById(id) {
  return books.find((book) => book.id === id) || null;
}

function create({ title, author, publishedYear }) {
  const book = { id: nextId++, title, author, publishedYear };
  books.push(book);
  return book;
}

function update(id, fields) {
  const book = findById(id);
  if (!book) return null;
  Object.assign(book, fields);
  return book;
}

function remove(id) {
  const index = books.findIndex((book) => book.id === id);
  if (index === -1) return false;
  books.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
