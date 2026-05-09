const studentModel = require('../models/studentModel');
const feeModel     = require('../models/feeModel');
const studentDto   = require('../dtos/studentDto');

async function createStudent(data) {
  const student = await studentModel.create(data);
  await feeModel.createAccount(student.id);
  return studentDto(student);
}

async function getAllStudents() {
  const students = await studentModel.findAll();
  return students.map(studentDto);
}

async function getStudentById(id) {
  const student = await studentModel.findById(id);
  if (!student) throw new Error('Student not found');
  return studentDto(student);
}

async function updateStudent(id, data) {
  const student = await studentModel.update(id, data);
  if (!student) throw new Error('Student not found');
  return studentDto(student);
}

async function deleteStudent(id) {
  const student = await studentModel.remove(id);
  if (!student) throw new Error('Student not found');
  return studentDto(student);
}

module.exports = { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent };
