const gradeService = require('../services/gradeService');

async function recordGrade(req, res) {
  try {
    const grade = await gradeService.recordGrade(req.body, req.user.id);
    res.status(201).json({ message: 'Grade recorded', data: grade });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getStudentGrades(req, res) {
  try {
    const grades = await gradeService.getStudentGrades(req.params.studentId);
    res.status(200).json({ data: grades });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getClassGrades(req, res) {
  try {
    const grades = await gradeService.getClassGrades(req.params.classId);
    res.status(200).json({ data: grades });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteGrade(req, res) {
  try {
    const grade = await gradeService.deleteGrade(req.params.id);
    res.status(200).json({ message: 'Grade deleted', data: grade });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { recordGrade, getStudentGrades, getClassGrades, deleteGrade };
