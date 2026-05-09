const express         = require('express');
const router          = express.Router();
const feeController   = require('../controllers/feeController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/',                        authenticate, authorize('admin'), feeController.getAllAccounts);
router.get('/:studentId',              authenticate, feeController.getBalance);
router.get('/:studentId/history',      authenticate, feeController.getHistory);
router.post('/deposit',                authenticate, feeController.deposit);
router.post('/withdraw',               authenticate, feeController.withdraw);

module.exports = router;
