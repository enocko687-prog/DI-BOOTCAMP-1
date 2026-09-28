// Exercise 1: Simple Express app with routes
const express = require('express');
const router = express.Router();

const app = express();
const PORT = 3000;

router.get('/', (req, res) => {
  res.send('Homepage');
});

router.get('/about', (req, res) => {
  res.send('About Us page');
});

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// -------------------------------------------------------------------
// Exercise 2: Todo list API using express.Router()
const expressTodos = require('express');
const todoApp = expressTodos();
const todoRouter = expressTodos.Router();

const todos = [];

todoRouter.get('/', (req, res) => {
  res.json(todos);
});

todoRouter.post('/', (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const newTodo = {
    id: Date.now(),
    title,
    completed: false
  };

  todos.push(newTodo);
  return res.status(201).json(newTodo);
});

todoRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  const todoIndex = todos.findIndex((todo) => todo.id === Number(id));

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  todos[todoIndex] = {
    ...todos[todoIndex],
    title: title ?? todos[todoIndex].title,
    completed: completed ?? todos[todoIndex].completed
  };

  return res.json(todos[todoIndex]);
});

todoRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex((todo) => todo.id === Number(id));

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];
  return res.json({ message: 'Todo deleted', todo: deletedTodo });
});

todoApp.use(expressTodos.json());
todoApp.use('/todos', todoRouter);

todoApp.listen(3001, () => {
  console.log('Todo API running on http://localhost:3001');
});

// -------------------------------------------------------------------
// Exercise 3: Books API using express.Router()
const booksApp = require('express')();
const booksRouter = require('express').Router();

const books = [];

booksRouter.get('/', (req, res) => {
  res.json(books);
});

booksRouter.post('/', (req, res) => {
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

booksRouter.put('/:id', (req, res) => {
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

booksRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const bookIndex = books.findIndex((book) => book.id === Number(id));

  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];
  return res.json({ message: 'Book deleted', book: deletedBook });
});

booksApp.use(require('express').json());
booksApp.use('/books', booksRouter);

booksApp.listen(3002, () => {
  console.log('Books API running on http://localhost:3002');
});
