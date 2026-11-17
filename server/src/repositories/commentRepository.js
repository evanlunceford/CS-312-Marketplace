import { pool } from "../db/pool.js";

// Check whether a listing exists
export async function listingExists(listingId) {
  const result = await pool.query(
    `SELECT id
     FROM listings
     WHERE id = $1`,
    [listingId]
  );

  return result.rowCount === 1;
}

// Retrieve all comments for a listing
export async function findCommentsByListingId(listingId) {
  const result = await pool.query(
    `SELECT
       c.id,
       c.listing_id AS "listingId",
       c.user_id AS "userId",
       u.name AS "authorName",
       c.content,
       c.created_at AS "createdAt"
     FROM comments c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.listing_id = $1
     ORDER BY c.created_at ASC, c.id ASC`,
    [listingId]
  );

  return result.rows;
}

// Create a new comment
export async function insertComment(
  listingId,
  userId,
  content
) {
  const result = await pool.query(
    `WITH new_comment AS (
       INSERT INTO comments (listing_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *
     )
     SELECT
       c.id,
       c.listing_id AS "listingId",
       c.user_id AS "userId",
       u.name AS "authorName",
       c.content,
       c.created_at AS "createdAt"
     FROM new_comment c
     JOIN users u ON c.user_id = u.user_id`,
    [listingId, userId, content]
  );

  return result.rows[0] ?? null;
}