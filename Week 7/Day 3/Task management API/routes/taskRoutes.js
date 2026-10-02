const express = require('express');
const { randomUUID } = require('node:crypto');
const { readTasks, updateTasks } = require('../services/taskStore');

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function validateTaskBody(body, { requireTitle = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object');
    error.status = 400;
    throw error;
  }

  if (requireTitle && (typeof body.title !== 'string' || !body.title.trim())) {
    const error = new Error('A non-empty title is required');
    error.status = 400;
    throw error;
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    const error = new Error('Description must be a string');
    error.status = 400;
    throw error;
  }

  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    const error = new Error('Completed must be a boolean');
    error.status = 400;
    throw error;
  }
}

function notFoundError() {
  const error = new Error('Task not found');
  error.status = 404;
  return error;
}

router.get('/', asyncHandler(async (req, res) => {
  res.json(await readTasks());
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const tasks = await readTasks();
  const task = tasks.find((item) => item.id === req.params.id);

  if (!task) {
    throw notFoundError();
  }

  res.json(task);
}));

router.post('/', asyncHandler(async (req, res) => {
  validateTaskBody(req.body, { requireTitle: true });

  const now = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title: req.body.title.trim(),
    description: req.body.description?.trim() || '',
    completed: req.body.completed ?? false,
    createdAt: now,
    updatedAt: now,
  };

  await updateTasks((tasks) => tasks.push(task));
  res.status(201).json(task);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  validateTaskBody(req.body, { requireTitle: true });

  const task = await updateTasks((tasks) => {
    const index = tasks.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      throw notFoundError();
    }

    const currentTask = tasks[index];
    const updatedTask = {
      ...currentTask,
      title: req.body.title.trim(),
      description: req.body.description === undefined
        ? currentTask.description
        : req.body.description.trim(),
      completed: req.body.completed ?? currentTask.completed,
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updatedTask;
    return updatedTask;
  });

  res.json(task);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await updateTasks((tasks) => {
    const index = tasks.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      throw notFoundError();
    }

    tasks.splice(index, 1);
  });

  res.status(204).send();
}));

module.exports = router;