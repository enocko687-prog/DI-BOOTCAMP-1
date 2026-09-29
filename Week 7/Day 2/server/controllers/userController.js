const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function getRequestBody(req) {
  if (req.body === undefined) {
    return {};
  }
  if (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw badRequest('Request body must be a JSON object');
  }
  return req.body;
}

function parseUserId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw badRequest('User ID must be a positive integer');
  }
  return id;
}

function optionalText(body, field) {
  if (!(field in body)) {
    return undefined;
  }
  if (body[field] !== null && typeof body[field] !== 'string') {
    throw badRequest(`${field} must be a string or null`);
  }
  return typeof body[field] === 'string' ? body[field].trim() || null : null;
}

async function register(req, res) {
  const body = getRequestBody(req);
  const { username, password } = body;
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password) {
    throw badRequest('Username and password are required');
  }

  const user = {
    username: username.trim(),
    email: optionalText(body, 'email'),
    first_name: optionalText(body, 'first_name'),
    last_name: optionalText(body, 'last_name')
  };
  const passwordHash = await bcrypt.hash(password, 10);
  const createdUser = await userModel.createUser(user, passwordHash);
  return res.status(201).json({ message: 'User registered successfully', user: createdUser });
}

async function login(req, res) {
  const { username, password } = getRequestBody(req);
  if (typeof username !== 'string' || !username.trim() ||
      typeof password !== 'string' || !password) {
    throw badRequest('Username and password are required');
  }

  const passwordHash = await userModel.getPasswordHash(username.trim());
  if (!passwordHash || !(await bcrypt.compare(password, passwordHash))) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  return res.status(200).json({ message: 'Login successful' });
}

async function getUsers(req, res) {
  const users = await userModel.getAllUsers();
  return res.status(200).json(users);
}

async function getUser(req, res) {
  const user = await userModel.getUserById(parseUserId(req.params.id));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.status(200).json(user);
}

async function updateUser(req, res) {
  const body = getRequestBody(req);
  const updates = {};
  for (const field of ['email', 'username', 'first_name', 'last_name']) {
    const value = optionalText(body, field);
    if (value !== undefined) {
      if (field === 'username' && !value) {
        throw badRequest('Username cannot be empty');
      }
      updates[field] = value;
    }
  }

  let passwordHash;
  if ('password' in body) {
    if (typeof body.password !== 'string' || !body.password) {
      throw badRequest('Password must be a non-empty string');
    }
    passwordHash = await bcrypt.hash(body.password, 10);
  }

  if (Object.keys(updates).length === 0 && !passwordHash) {
    throw badRequest('At least one user field or password is required');
  }

  const user = await userModel.updateUser(
    parseUserId(req.params.id),
    updates,
    passwordHash
  );
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.status(200).json({ message: 'User updated successfully', user });
}

module.exports = { register, login, getUsers, getUser, updateUser };