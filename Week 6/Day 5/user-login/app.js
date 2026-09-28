const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
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

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
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
    return res.status(200).json({ message: 'Profile access granted', user: decoded });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`User Login API running on http://localhost:${PORT}`);
});
