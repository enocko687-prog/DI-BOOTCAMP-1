const pool = require("../config/database");

async function findAll() {
  const result = await pool.query(
    "SELECT id, title, content, created_at FROM posts ORDER BY id"
  );
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(
    "SELECT id, title, content, created_at FROM posts WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

async function create({ title, content }) {
  const result = await pool.query(
    "INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING id, title, content, created_at",
    [title, content]
  );
  return result.rows[0];
}

async function update(id, { title, content }) {
  const result = await pool.query(
    `UPDATE posts
     SET title = COALESCE($2, title), content = COALESCE($3, content)
     WHERE id = $1
     RETURNING id, title, content, created_at`,
    [id, title ?? null, content ?? null]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query(
    "DELETE FROM posts WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
