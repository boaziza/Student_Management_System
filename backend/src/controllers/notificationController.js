const notificationService = require('../services/notificationService');

async function getMyNotifications(req, res) {
  try {
    const notifications = await notificationService.getMyNotifications(req.user.id);
    res.status(200).json({ data: notifications });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function markRead(req, res) {
  try {
    const notification = await notificationService.markRead(req.params.id, req.user.id);
    res.status(200).json({ message: 'Marked as read', data: notification });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function markAllRead(req, res) {
  try {
    await notificationService.markAllRead(req.user.id);
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteNotification(req, res) {
  try {
    const notification = await notificationService.deleteNotification(req.params.id);
    res.status(200).json({ message: 'Notification deleted', data: notification });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getMyNotifications, markRead, markAllRead, deleteNotification };
