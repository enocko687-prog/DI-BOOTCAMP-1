const pool = require('../config/db');

async function initializeTasksTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);
}

async function getAllTodos() {
  const result = await pool.query(
    'SELECT id, title, completed FROM tasks ORDER BY id'
  );
  return result.rows;
}

async function getTodoById(id) {
  const result = await pool.query(
    'SELECT id, title, completed FROM tasks WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function createTodo(title, completed) {
  const result = await pool.query(
    'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING id, title, completed',
    [title, completed]
  );
  return result.rows[0];
}

async function updateTodo(id, title, completed) {
  const result = await pool.query(
    'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING id, title, completed',
    [title, completed, id]
  );
  return result.rows[0];
}

async function deleteTodo(id) {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 RETURNING id, title, completed',
    [id]
  );
  return result.rows[0];
}

module.exports = {
  initializeTasksTable,
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo
};