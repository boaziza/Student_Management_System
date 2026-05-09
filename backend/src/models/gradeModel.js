const pool = require('../config/db');

async function upsert(data) {
  const result = await pool.query(
    `INSERT INTO grades (student_id, class_subject_id, term, score, max_score, grade_letter, comments, recorded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (student_id, class_subject_id, term)
     DO UPDATE SET score = $4, max_score = $5, grade_letter = $6, comments = $7, recorded_by = $8
     RETURNING *`,
    [data.student_id, data.class_subject_id, data.term, data.score,
     data.max_score || 100, data.grade_letter, data.comments, data.recorded_by]
  );
  return result.rows[0];
}

async function findByStudent(studentId) {
  const result = await pool.query(
    `SELECT g.*, s.name AS subject_name, u.first_name AS teacher_first, u.last_name AS teacher_last
     FROM grades g
     JOIN class_subjects cs ON g.class_subject_id = cs.id
     JOIN subjects s        ON cs.subject_id       = s.id
     LEFT JOIN teachers t   ON g.recorded_by       = t.id
     LEFT JOIN users u      ON t.user_id            = u.id
     WHERE g.student_id = $1
     ORDER BY g.term, s.name`,
    [studentId]
  );
  return result.rows;
}

async function findByClass(classId) {
  const result = await pool.query(
    `SELECT g.*, u.first_name, u.last_name, s.name AS subject_name
     FROM grades g
     JOIN students st       ON g.student_id        = st.id
     JOIN users u           ON st.user_id           = u.id
     JOIN class_subjects cs ON g.class_subject_id  = cs.id
     JOIN subjects s        ON cs.subject_id        = s.id
     WHERE cs.class_id = $1
     ORDER BY u.last_name, g.term`,
    [classId]
  );
  return result.rows;
}

async function remove(id) {
  const result = await pool.query(
    'DELETE FROM grades WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = { upsert, findByStudent, findByClass, remove };
