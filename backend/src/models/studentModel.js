const pool = require('../config/db');

async function create(data) {
  const result = await pool.query(
    `INSERT INTO students (user_id, student_number, class_id, date_of_birth)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.user_id, data.student_number, data.class_id, data.date_of_birth]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    `SELECT s.*, u.first_name, u.last_name, u.email, u.phone
     FROM students s JOIN users u ON s.user_id = u.id
     WHERE s.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findByUserId(userId) {
  const result = await pool.query(
    'SELECT * FROM students WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

async function findAll() {
  const result = await pool.query(
    `SELECT s.*, u.first_name, u.last_name, u.email, u.phone
     FROM students s JOIN users u ON s.user_id = u.id
     ORDER BY u.last_name ASC`
  );
  return result.rows;
}

async function update(id, data) {
  const result = await pool.query(
    `UPDATE students SET class_id = $1, date_of_birth = $2
     WHERE id = $3 RETURNING *`,
    [data.class_id, data.date_of_birth, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM students WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { create, findById, findByUserId, findAll, update, remove };
