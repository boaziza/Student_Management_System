const express          = require('express');
const router           = express.Router();
const deviceController = require('../controllers/deviceController');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/',              authenticate, deviceController.registerDevice);
router.get('/my',             authenticate, deviceController.getMyDevices);
router.get('/',               authenticate, authorize('admin'), deviceController.getAllDevices);
router.patch('/:id/verify',   authenticate, authorize('admin'), deviceController.verifyDevice);
router.delete('/:id',         authenticate, authorize('admin'), deviceController.removeDevice);

module.exports = router;
