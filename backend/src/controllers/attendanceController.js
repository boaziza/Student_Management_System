const attendanceService = require('../services/attendanceService');

async function recordAttendance(req, res) {
  try {
    const record = await attendanceService.recordAttendance(req.body, req.user.id);
    res.status(201).json({ message: 'Attendance recorded', data: record });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getStudentAttendance(req, res) {
  try {
    const records = await attendanceService.getStudentAttendance(req.params.studentId);
    res.status(200).json({ data: records });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getClassAttendance(req, res) {
  try {
    const records = await attendanceService.getClassAttendance(req.params.classId, req.query.date);
    res.status(200).json({ data: records });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteAttendance(req, res) {
  try {
    const record = await attendanceService.deleteAttendance(req.params.id);
    res.status(200).json({ message: 'Attendance record deleted', data: record });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { recordAttendance, getStudentAttendance, getClassAttendance, deleteAttendance };
