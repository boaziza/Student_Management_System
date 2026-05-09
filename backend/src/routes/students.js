const express            = require('express');
const router             = express.Router();
const studentController  = require('../controllers/studentController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/',     authenticate, authorize('admin'), studentController.createStudent);
router.get('/',      authenticate, authorize('admin', 'teacher'), studentController.getAllStudents);
router.get('/:id',   authenticate, studentController.getStudentById);
router.patch('/:id', authenticate, authorize('admin'), studentController.updateStudent);
router.delete('/:id',authenticate, authorize('admin'), studentController.deleteStudent);

module.exports = router;
