const deviceModel      = require('../models/deviceModel');
const notificationModel = require('../models/notificationModel');
const deviceDto        = require('../dtos/deviceDto');

async function registerDevice(userId, data) {
  const existing = await deviceModel.findOne(userId, data.device_id);
  if (existing) return deviceDto(existing);

  const device = await deviceModel.create({
    user_id:     userId,
    device_id:   data.device_id,
    device_name: data.device_name,
  });
  return deviceDto(device);
}

async function getMyDevices(userId) {
  const devices = await deviceModel.findByUser(userId);
  return devices.map(deviceDto);
}

async function getAllDevices() {
  const devices = await deviceModel.findAll();
  return devices.map(deviceDto);
}

async function verifyDevice(id, adminId) {
  const device = await deviceModel.verify(id, adminId);
  if (!device) throw new Error('Device not found');

  await notificationModel.create({
    user_id: device.user_id,
    title:   'Device Verified',
    message: `Your device "${device.device_name}" has been verified. You can now log in.`,
    type:    'login',
  });

  return deviceDto(device);
}

async function removeDevice(id) {
  const device = await deviceModel.remove(id);
  if (!device) throw new Error('Device not found');
  return deviceDto(device);
}

module.exports = { registerDevice, getMyDevices, getAllDevices, verifyDevice, removeDevice };
