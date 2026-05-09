const pool = require('../config/db');

async function create(userId) {
  const result = await pool.query(
    'INSERT INTO parents (user_id) VALUES ($1) RETURNING *',
    [userId]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    `SELECT p.*, u.first_name, u.last_name, u.email, u.phone
     FROM parents p JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findByUserId(userId) {
  const result = await pool.query(
    'SELECT * FROM parents WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

async function findAll() {
  const result = await pool.query(
    `SELECT p.*, u.first_name, u.last_name, u.email, u.phone
     FROM parents p JOIN users u ON p.user_id = u.id
     ORDER BY u.last_name ASC`
  );
  return result.rows;
}

async function linkStudent(parentId, studentId, relationship = 'parent') {
  const result = await pool.query(
    `INSERT INTO parent_students (parent_id, student_id, relationship)
     VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *`,
    [parentId, studentId, relationship]
  );
  return result.rows[0];
}

async function getStudents(parentId) {
  const result = await pool.query(
    `SELECT s.*, u.first_name, u.last_name, ps.relationship
     FROM parent_students ps
     JOIN students s ON ps.student_id = s.id
     JOIN users u ON s.user_id = u.id
     WHERE ps.parent_id = $1`,
    [parentId]
  );
  return result.rows;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM parents WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { create, findById, findByUserId, findAll, linkStudent, getStudents, remove };
