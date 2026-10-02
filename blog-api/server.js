const express = require('express');
const pool = require('./server/config/db');
const { initializePostsTable } = require('./server/models/postModel');
const postRoutes = require('./server/routes/postRoutes');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use('/posts', postRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Invalid route' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = status < 500 ? err.message : 'Server error';
  return res.status(status).json({ message });
});

async function startServer() {
  try {
    await initializePostsTable();
    app.listen(PORT, () => {
      console.log(`Blog API server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to PostgreSQL or initialize posts table:', error);
    await pool.end();
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
