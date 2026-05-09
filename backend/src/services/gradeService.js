const gradeModel = require('../models/gradeModel');

async function recordGrade(data, teacherId) {
  return await gradeModel.upsert({ ...data, recorded_by: teacherId });
}

async function getStudentGrades(studentId) {
  const grades = await gradeModel.findByStudent(studentId);
  if (grades.length === 0) throw new Error('No grades found');
  return grades;
}

async function getClassGrades(classId) {
  return await gradeModel.findByClass(classId);
}

async function deleteGrade(id) {
  const grade = await gradeModel.remove(id);
  if (!grade) throw new Error('Grade not found');
  return grade;
}

module.exports = { recordGrade, getStudentGrades, getClassGrades, deleteGrade };
