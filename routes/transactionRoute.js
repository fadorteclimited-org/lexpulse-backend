const express = require('express');
const router = express.Router();
const { initiateHold, completeTransaction, getHostTransactions, getUserWallets} = require('../controllers/transactionController');
const auth = require('../middleware/authMiddleware');

// Route to initiate a hold on a ticket
router.route('/initiate').post(auth, initiateHold);

// Route to complete the transaction
router.route('/complete/:reference').get( completeTransaction);
router.route('/host/:id').get(auth,getHostTransactions)
router.route('/wallets/:id').get(auth,getUserWallets)
module.exports = router;