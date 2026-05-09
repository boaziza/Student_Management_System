const express          = require('express');
const router           = express.Router();
const parentController = require('../controllers/parentController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/',                 authenticate, authorize('admin'), parentController.createParent);
router.get('/',                  authenticate, authorize('admin'), parentController.getAllParents);
router.get('/:id',               authenticate, parentController.getParentById);
router.post('/:id/link-student', authenticate, authorize('admin'), parentController.linkStudent);
router.get('/:id/children',      authenticate, parentController.getMyChildren);
router.delete('/:id',            authenticate, authorize('admin'), parentController.deleteParent);

module.exports = router;
