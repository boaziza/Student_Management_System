const express                  = require('express');
const router                   = express.Router();
const notificationController   = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');

router.get('/',              authenticate, notificationController.getMyNotifications);
router.patch('/:id/read',    authenticate, notificationController.markRead);
router.patch('/read-all',    authenticate, notificationController.markAllRead);
router.delete('/:id',        authenticate, notificationController.deleteNotification);

module.exports = router;
