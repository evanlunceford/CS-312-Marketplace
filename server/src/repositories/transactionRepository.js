import { pool } from "../db/pool.js";

const TRANSACTION_COLUMNS = `
  id,
  listing_id AS "listingId",
  buyer_id AS "buyerId",
  seller_id AS "sellerId",
  sale_price AS "salePrice",
  created_at AS "createdAt"
`;

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

// Find and lock a listing
export async function findListingForUpdate(client, listingId) {
  const result = await client.query(
    `SELECT id, user_id, title, price, status
     FROM listings
     WHERE id = $1
     FOR UPDATE`,
    [listingId]
  );

  return result.rows[0] ?? null;
}

// Find a user by their ID
export async function findUserById(client, userId) {
  const result = await client.query(
    `SELECT user_id AS "userId", name
     FROM users
     WHERE LOWER(user_id) = LOWER($1)
     FOR KEY SHARE`,
    [userId]
  );

  return result.rows[0] ?? null;
}

// Check whether a listing has already been sold
export async function findTransactionByListingId(client, listingId) {
  const result = await client.query(
    `SELECT ${TRANSACTION_COLUMNS}
     FROM transactions
     WHERE listing_id = $1`,
    [listingId]
  );

  return result.rows[0] ?? null;
}

// Create a transaction record
export async function insertTransaction(
  client,
  { listingId, buyerId, sellerId, salePrice }
) {
  const result = await client.query(
    `INSERT INTO transactions
       (listing_id, buyer_id, seller_id, sale_price)
     VALUES ($1, $2, $3, $4)
     RETURNING ${TRANSACTION_COLUMNS}`,
    [listingId, buyerId, sellerId, salePrice]
  );

  return result.rows[0] ?? null;
}

// Mark a listing as sold
export async function markListingSold(client, listingId) {
  const result = await client.query(
    `UPDATE listings
     SET status = 'sold',
         updated_at = NOW()
     WHERE id = $1 AND status = 'active'
     RETURNING id, status`,
    [listingId]
  );

  return result.rows[0] ?? null;
}

// Retrieve transactions involving a user
export async function findTransactionsByUserId(userId) {
  const result = await pool.query(
    `SELECT
       t.id,
       t.listing_id AS "listingId",
       t.buyer_id AS "buyerId",
       t.seller_id AS "sellerId",
       t.sale_price AS "salePrice",
       t.created_at AS "createdAt",
       l.title AS "listingTitle",
       b.name AS "buyerName",
       s.name AS "sellerName"
     FROM transactions t
     JOIN listings l ON t.listing_id = l.id
     JOIN users b ON t.buyer_id = b.user_id
     JOIN users s ON t.seller_id = s.user_id
     WHERE t.buyer_id = $1 OR t.seller_id = $1
     ORDER BY t.created_at DESC, t.id DESC`,
    [userId]
  );

  return result.rows;
}

// Retrieve a transaction by its ID
export async function findTransactionById(transactionId) {
  const result = await pool.query(
    `SELECT
       t.id,
       t.listing_id AS "listingId",
       t.buyer_id AS "buyerId",
       t.seller_id AS "sellerId",
       t.sale_price AS "salePrice",
       t.created_at AS "createdAt",
       l.title AS "listingTitle",
       b.name AS "buyerName",
       s.name AS "sellerName"
     FROM transactions t
     JOIN listings l ON t.listing_id = l.id
     JOIN users b ON t.buyer_id = b.user_id
     JOIN users s ON t.seller_id = s.user_id
     WHERE t.id = $1`,
    [transactionId]
  );

  return result.rows[0] ?? null;
}