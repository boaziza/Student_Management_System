const deviceService = require('../services/deviceService');

async function registerDevice(req, res) {
  try {
    const device = await deviceService.registerDevice(req.user.id, req.body);
    res.status(201).json({ message: 'Device registered', data: device });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getMyDevices(req, res) {
  try {
    const devices = await deviceService.getMyDevices(req.user.id);
    res.status(200).json({ data: devices });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getAllDevices(req, res) {
  try {
    const devices = await deviceService.getAllDevices();
    res.status(200).json({ data: devices });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function verifyDevice(req, res) {
  try {
    const device = await deviceService.verifyDevice(req.params.id, req.user.id);
    res.status(200).json({ message: 'Device verified', data: device });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function removeDevice(req, res) {
  try {
    const device = await deviceService.removeDevice(req.params.id);
    res.status(200).json({ message: 'Device removed', data: device });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { registerDevice, getMyDevices, getAllDevices, verifyDevice, removeDevice };
