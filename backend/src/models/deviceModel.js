const pool = require('../config/db');

async function create(data) {
  const result = await pool.query(
    `INSERT INTO devices (user_id, device_id, device_name)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.user_id, data.device_id, data.device_name]
  );
  return result.rows[0];
}

async function findOne(userId, deviceId) {
  const result = await pool.query(
    'SELECT * FROM devices WHERE user_id = $1 AND device_id = $2',
    [userId, deviceId]
  );
  return result.rows[0] || null;
}

async function findByUser(userId) {
  const result = await pool.query(
    'SELECT * FROM devices WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function findAll() {
  const result = await pool.query(
    'SELECT * FROM devices ORDER BY created_at DESC'
  );
  return result.rows;
}

async function verify(id, verifiedBy) {
  const result = await pool.query(
    `UPDATE devices SET is_verified = TRUE, verified_at = NOW(), verified_by = $1
     WHERE id = $2 RETURNING *`,
    [verifiedBy, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM devices WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { create, findOne, findByUser, findAll, verify, remove };
