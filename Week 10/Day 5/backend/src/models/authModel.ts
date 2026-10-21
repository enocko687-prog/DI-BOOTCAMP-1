import { pool } from "../db/pool.js";

export interface DbUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
}

export async function createUser(
  username: string,
  email: string,
  passwordHash: string,
): Promise<DbUser> {
  const result = await pool.query<DbUser>(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, password_hash`,
    [username, email, passwordHash],
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<DbUser | undefined> {
  const result = await pool.query<DbUser>(
    "SELECT id, username, email, password_hash FROM users WHERE email = $1",
    [email],
  );
  return result.rows[0];
}

export async function findUserById(id: number): Promise<Omit<DbUser, "password_hash"> | undefined> {
  const result = await pool.query<Omit<DbUser, "password_hash">>(
    "SELECT id, username, email FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0];
}

export async function saveRefreshToken(
  userId: number,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await pool.query(
    "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
    [userId, tokenHash, expiresAt],
  );
}

export async function consumeRefreshToken(
  tokenHash: string,
): Promise<number | undefined> {
  const result = await pool.query<{ user_id: number }>(
    `DELETE FROM refresh_tokens
     WHERE token_hash = $1 AND expires_at > NOW()
     RETURNING user_id`,
    [tokenHash],
  );
  return result.rows[0]?.user_id;
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  await pool.query("DELETE FROM refresh_tokens WHERE token_hash = $1", [tokenHash]);
}
