import { pool } from "../db/pool.js";

// Retrieve a user's profile
export async function findProfileByUserId(userId) {
  const result = await pool.query(
    `SELECT
       u.user_id AS "userId",
       u.name,
       u.created_at AS "createdAt",
       COALESCE(p.bio, '') AS bio,
       p.updated_at AS "updatedAt"
     FROM users u
     LEFT JOIN user_profiles p
       ON u.user_id = p.user_id
     WHERE LOWER(u.user_id) = LOWER($1)`,
    [userId]
  );

  return result.rows[0] ?? null;
}

// Retrieve a user's listings
export async function findListingsByUserId(userId) {
  const result = await pool.query(
    `SELECT id, title, description, price, category,
            status, image_path, created_at
     FROM listings
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}

// Update a user's profile
export async function updateProfile(userId, { name, bio }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `UPDATE users
       SET name = $1
       WHERE user_id = $2
       RETURNING user_id`,
      [name, userId]
    );

    if (userResult.rowCount !== 1) {
      throw new Error("User was not updated");
    }

    const profileResult = await client.query(
      `INSERT INTO user_profiles (user_id, bio, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         bio = EXCLUDED.bio,
         updated_at = NOW()
       RETURNING user_id`,
      [userId, bio]
    );

    if (profileResult.rowCount !== 1) {
      throw new Error("Profile was not updated");
    }

    const result = await client.query(
      `SELECT
         u.user_id AS "userId",
         u.name,
         u.created_at AS "createdAt",
         p.bio,
         p.updated_at AS "updatedAt"
       FROM users u
       JOIN user_profiles p
         ON u.user_id = p.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (
      result.rowCount !== 1 ||
      result.rows[0].name !== name ||
      result.rows[0].bio !== bio
    ) {
      throw new Error("Profile was not saved correctly");
    }

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}