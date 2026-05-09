const pool = require('../config/db');

async function record(data) {
  const result = await pool.query(
    `INSERT INTO attendance (student_id, class_subject_id, date, status, notes, recorded_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (student_id, class_subject_id, date)
     DO UPDATE SET status = $4, notes = $5, recorded_by = $6
     RETURNING *`,
    [data.student_id, data.class_subject_id, data.date, data.status, data.notes, data.recorded_by]
  );
  return result.rows[0];
}

async function findByStudent(studentId) {
  const result = await pool.query(
    `SELECT a.*, s.name AS subject_name
     FROM attendance a
     JOIN class_subjects cs ON a.class_subject_id = cs.id
     JOIN subjects s        ON cs.subject_id       = s.id
     WHERE a.student_id = $1
     ORDER BY a.date DESC`,
    [studentId]
  );
  return result.rows;
}

async function findByClassAndDate(classId, date) {
  const result = await pool.query(
    `SELECT a.*, u.first_name, u.last_name
     FROM attendance a
     JOIN students st       ON a.student_id        = st.id
     JOIN users u           ON st.user_id           = u.id
     JOIN class_subjects cs ON a.class_subject_id  = cs.id
     WHERE cs.class_id = $1 AND a.date = $2
     ORDER BY u.last_name`,
    [classId, date]
  );
  return result.rows;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM attendance WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { record, findByStudent, findByClassAndDate, remove };
