const express       = require('express');
const router        = express.Router();
const feeController = require('../controllers/feeController');
const { authenticate } = require('../middlewares/auth');

// fee_transactions are accessed through fee_accounts routes
// this file re-exposes history endpoint by student
router.get('/:studentId', authenticate, feeController.getHistory);

module.exports = router;
