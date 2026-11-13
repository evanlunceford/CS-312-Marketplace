import { pool } from "../db/pool.js";

export async function insertSession({ tokenHash, userId, expiresAt }) {
  await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
    tokenHash,
    userId,
    expiresAt,
  ]);
}

// Returns the user who owns an unexpired session, or null.
export async function findUserBySessionTokenHash(tokenHash) {
  const result = await pool.query(
    `SELECT users.user_id AS "userId", users.name, users.email, users.created_at AS "createdAt"
       FROM sessions JOIN users ON users.user_id = sessions.user_id
      WHERE sessions.token_hash = $1 AND sessions.expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] ?? null;
}

export async function deleteSession(tokenHash) {
  await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
}
