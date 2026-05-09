const parentModel  = require('../models/parentModel');
const studentModel = require('../models/studentModel');

function parentDto(parent) {
  return {
    id:         parent.id,
    user_id:    parent.user_id,
    first_name: parent.first_name,
    last_name:  parent.last_name,
    email:      parent.email,
    phone:      parent.phone,
    created_at: parent.created_at,
  };
}

async function createParent(userId) {
  const parent = await parentModel.create(userId);
  return parentDto(parent);
}

async function getAllParents() {
  const parents = await parentModel.findAll();
  return parents.map(parentDto);
}

async function getParentById(id) {
  const parent = await parentModel.findById(id);
  if (!parent) throw new Error('Parent not found');
  return parentDto(parent);
}

async function linkStudent(parentId, studentId, relationship) {
  const parent  = await parentModel.findById(parentId);
  if (!parent) throw new Error('Parent not found');

  const student = await studentModel.findById(studentId);
  if (!student) throw new Error('Student not found');

  return await parentModel.linkStudent(parentId, studentId, relationship);
}

async function getMyChildren(parentId) {
  return await parentModel.getStudents(parentId);
}

async function deleteParent(id) {
  const parent = await parentModel.remove(id);
  if (!parent) throw new Error('Parent not found');
  return parentDto(parent);
}

module.exports = { createParent, getAllParents, getParentById, linkStudent, getMyChildren, deleteParent };
