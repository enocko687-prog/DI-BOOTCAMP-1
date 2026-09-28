const express = require('express');
const router = express.Router();

const todos = [];

router.get('/', (req, res) => {
  res.json(todos);
});

router.post('/', (req, res) => {
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

router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex((todo) => todo.id === Number(id));

  if (todoIndex === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  const deletedTodo = todos.splice(todoIndex, 1)[0];
  return res.json({ message: 'Todo deleted', todo: deletedTodo });
});

module.exports = router;
