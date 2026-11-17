import { pool } from "../db/pool.js";

// Execute operations inside a database transaction
export async function runInTransaction(operation) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await operation(client);

    await client.query("COMMIT");

    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Retrieve and lock a listing
export async function findListingForUpdate(client, listingId) {
  const result = await client.query(
    `SELECT id, user_id, status, image_path
     FROM listings
     WHERE id = $1
     FOR UPDATE`,
    [listingId]
  );

  return result.rows[0] ?? null;
}

// Check whether a transaction exists for the listing
export async function hasTransaction(client, listingId) {
  const result = await client.query(
    `SELECT id
     FROM transactions
     WHERE listing_id = $1`,
    [listingId]
  );

  return result.rowCount > 0;
}

// Update the listing's image path
export async function updateListingImage(
  client,
  listingId,
  userId,
  imagePath
) {
  const result = await client.query(
    `UPDATE listings
     SET image_path = $1,
         updated_at = NOW()
     WHERE id = $2
       AND user_id = $3
       AND status = 'active'
     RETURNING *`,
    [imagePath, listingId, userId]
  );

  return result.rows[0] ?? null;
}