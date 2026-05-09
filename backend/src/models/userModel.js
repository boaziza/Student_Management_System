const pool = require('../config/db');

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function findAll() {
  const result = await pool.query(
    'SELECT * FROM users ORDER BY created_at DESC'
  );
  return result.rows;
}

async function create(data) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, password_salt, role, first_name, last_name, phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.email, data.password_hash, data.password_salt,
     data.role, data.first_name, data.last_name, data.phone]
  );
  return result.rows[0];
}

async function update(id, data) {
  const result = await pool.query(
    `UPDATE users
     SET email = $1, password_hash = $2, password_salt = $3,
         role = $4, first_name = $5, last_name = $6, phone = $7
     WHERE id = $8
     RETURNING *`,
    [data.email, data.password_hash, data.password_salt,
     data.role, data.first_name, data.last_name, data.phone, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { findByEmail, findById, findAll, create, update, remove };
