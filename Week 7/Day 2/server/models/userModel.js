const pool = require('../config/db');

const userColumns = 'id, email, username, first_name, last_name';

async function initializeUserTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      username TEXT NOT NULL UNIQUE,
      first_name TEXT,
      last_name TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS hashpwd (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE REFERENCES users(username)
        ON UPDATE CASCADE ON DELETE CASCADE,
      password TEXT NOT NULL
    )
  `);
}

async function createUser(user, passwordHash) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO users (email, username, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING ${userColumns}`,
      [user.email, user.username, user.first_name, user.last_name]
    );
    const createdUser = result.rows[0];

    await client.query(
      'INSERT INTO hashpwd (username, password) VALUES ($1, $2)',
      [createdUser.username, passwordHash]
    );
    await client.query('COMMIT');
    return createdUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getPasswordHash(username) {
  const result = await pool.query(
    'SELECT password FROM hashpwd WHERE username = $1',
    [username]
  );
  return result.rows[0]?.password;
}

async function getAllUsers() {
  const result = await pool.query(
    `SELECT ${userColumns} FROM users ORDER BY id`
  );
  return result.rows;
}

async function getUserById(id) {
  const result = await pool.query(
    `SELECT ${userColumns} FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

async function updateUser(id, updates, passwordHash) {
  const client = await pool.connect();
  const columns = {
    email: 'email',
    username: 'username',
    first_name: 'first_name',
    last_name: 'last_name'
  };
  const fields = Object.keys(columns).filter((field) => field in updates);
  const assignments = fields.map((field, index) => `${columns[field]} = $${index + 1}`);
  const values = fields.map((field) => updates[field]);

  try {
    await client.query('BEGIN');
    let updatedUser;
    if (fields.length > 0) {
      const result = await client.query(
        `UPDATE users SET ${assignments.join(', ')}
         WHERE id = $${values.length + 1}
         RETURNING ${userColumns}`,
        [...values, id]
      );
      updatedUser = result.rows[0];
    } else {
      const result = await client.query(
        `SELECT ${userColumns} FROM users WHERE id = $1`,
        [id]
      );
      updatedUser = result.rows[0];
    }

    if (!updatedUser) {
      await client.query('ROLLBACK');
      return undefined;
    }

    if (passwordHash) {
      await client.query(
        'UPDATE hashpwd SET password = $1 WHERE username = $2',
        [passwordHash, updatedUser.username]
      );
    }

    await client.query('COMMIT');
    return updatedUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  initializeUserTables,
  createUser,
  getPasswordHash,
  getAllUsers,
  getUserById,
  updateUser
};