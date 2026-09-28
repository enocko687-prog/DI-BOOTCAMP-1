const express = require('express');

const app = express();
const PORT = 5000;

app.use(express.json());

const books = [
  { id: 1, title: 'The Hobbit', author: 'J.R.R. Tolkien', publishedYear: 1937 },
  { id: 2, title: '1984', author: 'George Orwell', publishedYear: 1949 }
];

app.get('/api/books', (req, res) => {
  res.status(200).json({ books });
});

app.get('/api/books/:bookId', (req, res) => {
  const bookId = Number(req.params.bookId);
  const book = books.find((item) => item.id === bookId);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(book);
});

app.post('/api/books', (req, res) => {
  const { title, author, publishedYear } = req.body;

  if (!title || !author || !publishedYear) {
    return res.status(400).json({ message: 'Title, author, and publishedYear are required' });
  }

  const newBook = {
    id: books.length ? books[books.length - 1].id + 1 : 1,
    title,
    author,
    publishedYear
  };

  books.push(newBook);
  return res.status(201).json(newBook);
});

app.listen(PORT, () => {
  console.log(`Book API running on http://localhost:${PORT}`);
});
