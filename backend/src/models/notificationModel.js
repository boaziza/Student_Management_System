const pool = require('../config/db');

async function create(data) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, title, message, type)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.user_id, data.title, data.message, data.type]
  );
  return result.rows[0];
}

async function findByUser(userId) {
  const result = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function markRead(id, userId) {
  const result = await pool.query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function markAllRead(userId) {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
    [userId]
  );
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM notifications WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { create, findByUser, markRead, markAllRead, remove };
