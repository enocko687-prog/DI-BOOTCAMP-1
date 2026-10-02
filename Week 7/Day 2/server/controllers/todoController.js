const taskModel = require('../models/taskModel');

function parseTodoId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function isValidTitle(title) {
  return typeof title === 'string' && title.trim().length > 0;
}

async function getAllTodos(req, res) {
  const todos = await taskModel.getAllTodos();
  return res.status(200).json({ todos });
}

async function getTodoById(req, res) {
  const id = parseTodoId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Todo id must be a positive integer' });
  }

  const todo = await taskModel.getTodoById(id);
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  return res.status(200).json(todo);
}

async function createTodo(req, res) {
  const { title, completed = false } = req.body || {};
  if (!isValidTitle(title) || typeof completed !== 'boolean') {
    return res.status(400).json({
      message: 'A non-empty title and optional boolean completed value are required'
    });
  }

  const todo = await taskModel.createTodo(title.trim(), completed);
  return res.status(201).json(todo);
}

async function updateTodo(req, res) {
  const id = parseTodoId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Todo id must be a positive integer' });
  }

  const { title, completed } = req.body || {};
  if (!isValidTitle(title) || typeof completed !== 'boolean') {
    return res.status(400).json({
      message: 'A non-empty title and boolean completed value are required'
    });
  }

  const todo = await taskModel.updateTodo(id, title.trim(), completed);
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  return res.status(200).json(todo);
}

async function deleteTodo(req, res) {
  const id = parseTodoId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Todo id must be a positive integer' });
  }

  const todo = await taskModel.deleteTodo(id);
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  return res.status(200).json({ message: 'Todo deleted successfully', todo });
}

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};