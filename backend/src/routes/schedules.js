const express              = require('express');
const router               = express.Router();
const scheduleController   = require('../controllers/scheduleController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/',               authenticate, authorize('admin'), scheduleController.createSchedule);
router.get('/:id',             authenticate, scheduleController.getById);
router.get('/class/:classId',  authenticate, scheduleController.getByClass);
router.patch('/:id',           authenticate, authorize('admin'), scheduleController.updateSchedule);
router.delete('/:id',          authenticate, authorize('admin'), scheduleController.deleteSchedule);

module.exports = router;
