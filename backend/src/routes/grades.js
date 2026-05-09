const express          = require('express');
const router           = express.Router();
const gradeController  = require('../controllers/gradeController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/',                        authenticate, authorize('teacher'), gradeController.recordGrade);
router.get('/student/:studentId',       authenticate, gradeController.getStudentGrades);
router.get('/class/:classId',           authenticate, authorize('admin', 'teacher'), gradeController.getClassGrades);
router.delete('/:id',                   authenticate, authorize('admin', 'teacher'), gradeController.deleteGrade);

module.exports = router;
