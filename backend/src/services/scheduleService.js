const scheduleModel = require('../models/scheduleModel');

async function createSchedule(data) {
  return await scheduleModel.create(data);
}

async function getById(id) {
  const schedule = await scheduleModel.findById(id);
  if (!schedule) throw new Error('Schedule not found');
  return schedule;
}

async function getByClass(classId) {
  return await scheduleModel.findByClass(classId);
}

async function updateSchedule(id, data) {
  const schedule = await scheduleModel.update(id, data);
  if (!schedule) throw new Error('Schedule not found');
  return schedule;
}

async function deleteSchedule(id) {
  const schedule = await scheduleModel.remove(id);
  if (!schedule) throw new Error('Schedule not found');
  return schedule;
}

module.exports = { createSchedule, getById, getByClass, updateSchedule, deleteSchedule };
