const pool = require('../config/db');

async function create(data) {
  const result = await pool.query(
    `INSERT INTO schedules (class_subject_id, day_of_week, start_time, end_time, room)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.class_subject_id, data.day_of_week, data.start_time, data.end_time, data.room]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    'SELECT * FROM schedules WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function findByClass(classId) {
  const result = await pool.query(
    `SELECT sc.*, s.name AS subject_name, u.first_name AS teacher_first, u.last_name AS teacher_last
     FROM schedules sc
     JOIN class_subjects cs ON sc.class_subject_id = cs.id
     JOIN subjects s        ON cs.subject_id        = s.id
     LEFT JOIN teachers t   ON cs.teacher_id        = t.id
     LEFT JOIN users u      ON t.user_id            = u.id
     WHERE cs.class_id = $1
     ORDER BY sc.day_of_week, sc.start_time`,
    [classId]
  );
  return result.rows;
}

async function update(id, data) {
  const result = await pool.query(
    `UPDATE schedules SET day_of_week = $1, start_time = $2, end_time = $3, room = $4
     WHERE id = $5 RETURNING *`,
    [data.day_of_week, data.start_time, data.end_time, data.room, id]
  );
  return result.rows[0] || null;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM schedules WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { create, findById, findByClass, update, remove };
