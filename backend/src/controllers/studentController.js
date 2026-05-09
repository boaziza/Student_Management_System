const studentService = require('../services/studentService');

async function createStudent(req, res) {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({ message: 'Student created', data: student });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getAllStudents(req, res) {
  try {
    const students = await studentService.getAllStudents();
    res.status(200).json({ data: students });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getStudentById(req, res) {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.status(200).json({ data: student });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

async function updateStudent(req, res) {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.status(200).json({ message: 'Student updated', data: student });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteStudent(req, res) {
  try {
    const student = await studentService.deleteStudent(req.params.id);
    res.status(200).json({ message: 'Student deleted', data: student });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent };
