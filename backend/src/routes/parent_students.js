const express          = require('express');
const router           = express.Router();
const parentController = require('../controllers/parentController');
const { authenticate, authorize } = require('../middlewares/auth');

// parent_students links are managed through the parents routes
router.post('/',           authenticate, authorize('admin'), parentController.linkStudent);
router.get('/:id/children',authenticate, parentController.getMyChildren);

module.exports = router;
