import { pool } from "../db/pool.js";

// Never select password_hash except where the service needs it to verify a sign-in.
const PUBLIC_COLUMNS = `user_id AS "userId", name, email, created_at AS "createdAt"`;

export async function findUserById(userId) {
  const result = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE lower(user_id) = lower($1)`, [userId]);
  return result.rows[0] ?? null;
}

export async function findUserByEmail(email) {
  const result = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE lower(email) = lower($1)`, [email]);
  return result.rows[0] ?? null;
}

export async function findUserWithPasswordHash(userId) {
  const result = await pool.query(
    `SELECT ${PUBLIC_COLUMNS}, password_hash AS "passwordHash" FROM users WHERE lower(user_id) = lower($1)`,
    [userId]
  );
  return result.rows[0] ?? null;
}

// Throws the raw pg error (code 23505) if the user ID or email is already taken; the service handles that.
export async function insertUser({ userId, name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (user_id, name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING ${PUBLIC_COLUMNS}`,
    [userId, name, email, passwordHash]
  );
  return result.rows[0];
}
