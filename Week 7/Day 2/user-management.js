const express = require('express');
const pool = require('./server/config/db');
const { initializeUserTables } = require('./server/models/userModel');
const userRoutes = require('./server/routes/users');

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(express.json());
app.use('/', userRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.code === '23505') {
    return res.status(409).json({ message: 'Username or email already exists' });
  }

  const status = error.status || 500;
  const message = status < 500 ? error.message : 'Internal server error';
  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({ message });
});

async function startServer() {
  try {
    await initializeUserTables();
    app.listen(PORT, () => {
      console.log(`User Management API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to PostgreSQL or initialize user tables:', error);
    await pool.end();
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;