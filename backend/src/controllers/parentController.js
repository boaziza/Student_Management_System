const parentService = require('../services/parentService');

async function createParent(req, res) {
  try {
    const parent = await parentService.createParent(req.body.user_id);
    res.status(201).json({ message: 'Parent created', data: parent });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getAllParents(req, res) {
  try {
    const parents = await parentService.getAllParents();
    res.status(200).json({ data: parents });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getParentById(req, res) {
  try {
    const parent = await parentService.getParentById(req.params.id);
    res.status(200).json({ data: parent });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

async function linkStudent(req, res) {
  try {
    const link = await parentService.linkStudent(
      req.params.id, req.body.student_id, req.body.relationship
    );
    res.status(200).json({ message: 'Student linked to parent', data: link });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getMyChildren(req, res) {
  try {
    const children = await parentService.getMyChildren(req.params.id);
    res.status(200).json({ data: children });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteParent(req, res) {
  try {
    const parent = await parentService.deleteParent(req.params.id);
    res.status(200).json({ message: 'Parent deleted', data: parent });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { createParent, getAllParents, getParentById, linkStudent, getMyChildren, deleteParent };
