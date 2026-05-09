const notificationModel = require('../models/notificationModel');

async function getMyNotifications(userId) {
  return await notificationModel.findByUser(userId);
}

async function markRead(id, userId) {
  const notification = await notificationModel.markRead(id, userId);
  if (!notification) throw new Error('Notification not found');
  return notification;
}

async function markAllRead(userId) {
  await notificationModel.markAllRead(userId);
}

async function deleteNotification(id) {
  const notification = await notificationModel.remove(id);
  if (!notification) throw new Error('Notification not found');
  return notification;
}

module.exports = { getMyNotifications, markRead, markAllRead, deleteNotification };
