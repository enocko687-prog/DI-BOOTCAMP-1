const express = require('express');

const app = express();
const PORT = 5000;

app.use(express.json());

let todos = [
  { id: 1, title: 'Learn Express', completed: false },
  { id: 2, title: 'Build a CRUD API', completed: true }
];

app.get('/api/todos', (req, res) => {
  return res.status(200).json(todos);
});

app.get('/api/todos/:id', (req, res) => {
  const todoId = Number(req.params.id);
  const todo = todos.find((item) => item.id === todoId);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  return res.status(200).json(todo);
});

app.post('/api/todos', (req, res) => {
  const { title, completed } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const newTodo = {
    id: todos.length ? todos[todos.length - 1].id + 1 : 1,
    title,
    completed: Boolean(completed)
  };

  todos.push(newTodo);
  return res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
  const todoId = Number(req.params.id);
  const todoIndex = todos.findIndex((item) => item.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  const updatedTodo = {
    ...todos[todoIndex],
    ...req.body,
    id: todoId
  };

  todos[todoIndex] = updatedTodo;
  return res.status(200).json(updatedTodo);
});

app.delete('/api/todos/:id', (req, res) => {
  const todoId = Number(req.params.id);
  const todoIndex = todos.findIndex((item) => item.id === todoId);

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];
  return res.status(200).json({ message: 'Todo deleted successfully', todo: deletedTodo });
});

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Todo List API running on http://localhost:${PORT}`);
});
