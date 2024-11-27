const express = require('express');
const {
    addWithdrawalAccount,
    getPaystackBanks,
    getWithdrawalAccount,
    deleteWithdrawalAccount,
    requestPayout,
    getPayouts, getPawapayConfigs, getUserWithdrawalAccounts
} = require("../controllers/payoutsController");
const router = express.Router();



router.route('/banks').get(getPaystackBanks);
router.route('/configs').get(getPawapayConfigs);

router.route('/account/:id').get(getWithdrawalAccount).delete(deleteWithdrawalAccount);
router.route('/account/create').post(addWithdrawalAccount)
router.route('/accounts/:id').get(getUserWithdrawalAccounts)


router.route('/create').post(requestPayout);

router.route('/:id').get(getPayouts);

module.exports = router;