// Week 6 - Day 5 - Exercise XP Gold
// This file contains all three intermediate exercises in one place.
// Run each app separately or start them one by one because they use different ports.

const express = require('express');
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// =============================================
// Exercise 1: Intermediate CRUD API with Axios
// =============================================
const createCrudApi = () => {
  const app = express();
  const PORT = 5000;

  app.use(express.json());

  const BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

  app.get('/api/posts', async (req, res) => {
    try {
      const response = await axios.get(BASE_URL);
      return res.status(200).json(response.data);
    } catch (error) {
      return res.status(500).json({
        message: 'Error fetching posts',
        error: error.message,
      });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const response = await axios.get(`${BASE_URL}/${req.params.id}`);
      return res.status(200).json(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: 'Post not found' });
      }
      return res.status(500).json({
        message: 'Error fetching post',
        error: error.message,
      });
    }
  });

  app.post('/api/posts', async (req, res) => {
    try {
      const response = await axios.post(BASE_URL, req.body);
      return res.status(201).json(response.data);
    } catch (error) {
      return res.status(500).json({
        message: 'Error creating post',
        error: error.message,
      });
    }
  });

  app.put('/api/posts/:id', async (req, res) => {
    try {
      const response = await axios.put(`${BASE_URL}/${req.params.id}`, req.body);
      return res.status(200).json(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: 'Post not found' });
      }
      return res.status(500).json({
        message: 'Error updating post',
        error: error.message,
      });
    }
  });

  app.delete('/api/posts/:id', async (req, res) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${req.params.id}`);
      return res.status(200).json({
        message: 'Post deleted successfully',
        status: response.status,
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({ message: 'Post not found' });
      }
      return res.status(500).json({
        message: 'Error deleting post',
        error: error.message,
      });
    }
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.listen(PORT, () => {
    console.log(`Intermediate CRUD API running on http://localhost:${PORT}`);
  });
};

// =============================================
// Exercise 2: User Login System with Express
// =============================================
const createUserLoginApi = () => {
  const app = express();
  const PORT = 5001;
  const SECRET_KEY = 'mySecretKey123';

  app.use(express.json());

  const users = [];

  app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });

    return res.status(201).json({ message: 'User registered successfully' });
  });

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = users.find((item) => item.username === username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ message: 'Login successful', token });
  });

  app.get('/api/profile', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      return res.status(200).json({
        message: 'Profile access granted',
        user: decoded,
      });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.listen(PORT, () => {
    console.log(`User Login API running on http://localhost:${PORT}`);
  });
};

// =============================================
// Exercise 3: Todo List API
// =============================================
const createTodoApi = () => {
  const app = express();
  const PORT = 5002;

  app.use(express.json());

  let todos = [
    { id: 1, title: 'Learn Express', completed: false },
    { id: 2, title: 'Build a CRUD API', completed: true },
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
      completed: Boolean(completed),
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
      id: todoId,
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
    return res.status(200).json({
      message: 'Todo deleted successfully',
      todo: deletedTodo,
    });
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.listen(PORT, () => {
    console.log(`Todo List API running on http://localhost:${PORT}`);
  });
};

// Start the apps one by one.
// To test: run only one section at a time, or comment out the others.
createCrudApi();
// createUserLoginApi();
// createTodoApi();

// Example requests:
// GET /api/posts      -> http://localhost:5000/api/posts
// POST /api/register  -> http://localhost:5001/api/register
// GET /api/todos      -> http://localhost:5002/api/todos
