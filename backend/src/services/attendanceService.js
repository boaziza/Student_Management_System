const attendanceModel = require('../models/attendanceModel');

async function recordAttendance(data, teacherId) {
  return await attendanceModel.record({ ...data, recorded_by: teacherId });
}

async function getStudentAttendance(studentId) {
  return await attendanceModel.findByStudent(studentId);
}

async function getClassAttendance(classId, date) {
  return await attendanceModel.findByClassAndDate(classId, date);
}

async function deleteAttendance(id) {
  const record = await attendanceModel.remove(id);
  if (!record) throw new Error('Attendance record not found');
  return record;
}

module.exports = { recordAttendance, getStudentAttendance, getClassAttendance, deleteAttendance };
