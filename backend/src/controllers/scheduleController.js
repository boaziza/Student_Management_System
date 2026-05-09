const scheduleService = require('../services/scheduleService');

async function createSchedule(req, res) {
  try {
    const schedule = await scheduleService.createSchedule(req.body);
    res.status(201).json({ message: 'Schedule created', data: schedule });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const schedule = await scheduleService.getById(req.params.id);
    res.status(200).json({ data: schedule });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

async function getByClass(req, res) {
  try {
    const schedules = await scheduleService.getByClass(req.params.classId);
    res.status(200).json({ data: schedules });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateSchedule(req, res) {
  try {
    const schedule = await scheduleService.updateSchedule(req.params.id, req.body);
    res.status(200).json({ message: 'Schedule updated', data: schedule });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteSchedule(req, res) {
  try {
    const schedule = await scheduleService.deleteSchedule(req.params.id);
    res.status(200).json({ message: 'Schedule deleted', data: schedule });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { createSchedule, getById, getByClass, updateSchedule, deleteSchedule };
