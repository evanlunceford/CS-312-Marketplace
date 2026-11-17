import { pool } from '../db/pool.js';

class ListingRepository {
  async findAll() {
    const result = await pool.query(
      'SELECT l.*, u.name as seller_name FROM listings l JOIN users u ON l.user_id = u.user_id ORDER BY l.created_at DESC'
    );
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT l.*, u.name as seller_name FROM listings l JOIN users u ON l.user_id = u.user_id WHERE l.id = $1',
      [id]
    );
    return result.rows[0];
  }

  async create({ userId, title, description, price, category }) {
    const result = await pool.query(
      `INSERT INTO listings (user_id, title, description, price, category) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, description, price, category]
    );
    return result.rows[0];
  }

  async update(id, { title, description, price, category, status }) {
    const result = await pool.query(
      `UPDATE listings 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           price = COALESCE($3, price), 
           category = COALESCE($4, category), 
           status = COALESCE($5, status),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [title, description, price, category, status, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM listings WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
}

export default new ListingRepository();
