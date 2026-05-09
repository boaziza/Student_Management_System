const express               = require('express');
const router                = express.Router();
const attendanceController  = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/',                        authenticate, authorize('teacher'), attendanceController.recordAttendance);
router.get('/student/:studentId',       authenticate, attendanceController.getStudentAttendance);
router.get('/class/:classId',           authenticate, authorize('admin', 'teacher'), attendanceController.getClassAttendance);
router.delete('/:id',                   authenticate, authorize('admin', 'teacher'), attendanceController.deleteAttendance);

module.exports = router;
