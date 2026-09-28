const express = require('express');
const router = express.Router();

const books = [];

router.get('/', (req, res) => {
  res.json(books);
});

router.post('/', (req, res) => {
  const { title, author } = req.body;

  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  const newBook = {
    id: Date.now(),
    title,
    author
  };

  books.push(newBook);
  return res.status(201).json(newBook);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, author } = req.body;

  const bookIndex = books.findIndex((book) => book.id === Number(id));

  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  books[bookIndex] = {
    ...books[bookIndex],
    title: title ?? books[bookIndex].title,
    author: author ?? books[bookIndex].author
  };

  return res.json(books[bookIndex]);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const bookIndex = books.findIndex((book) => book.id === Number(id));

  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];
  return res.json({ message: 'Book deleted', book: deletedBook });
});

module.exports = router;
