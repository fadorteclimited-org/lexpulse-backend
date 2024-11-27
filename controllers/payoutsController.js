const Payout = require('../models/payoutModel');
const WithdrawalAccount = require('../models/withdrawalAccountModel');
const {createPaystackRecipient, getISO3CountryName} = require("../utils/helper");
const axios = require("axios");
const process = require("node:process");
const User = require("../models/userModel");

// @desc Create withdrawal account
// @route POST /api/v1/payouts/account/create
exports.addWithdrawalAccount = async (req, res) => {

    try {
        const {userId, type, name, accountNumber, bankCode, currency, bankName} = req.body;
        const user = await User.findById(userId).exec();
        let withdrawalAccount;
        if (user) {
            if (currency === 'GHS') {
                const recipient = await createPaystackRecipient(userId, type, name, accountNumber, bankCode, currency);
                if (recipient) {
                    console.log(recipient)
                    withdrawalAccount = await WithdrawalAccount.create({
                        userId: userId,
                        type: recipient.type,
                        name: name,
                        accountNumber: accountNumber,
                        bankCode: bankCode,
                        bankName: bankName,
                        currency: currency,
                        recipient_code: recipient.recipient_code,
                        service: 'Paystack'
                    });
                }
            } else {
                withdrawalAccount = await WithdrawalAccount.create({
                    userId: userId,
                    type: 'MSISDN',
                    name: name,
                    accountNumber: accountNumber,
                    currency: currency,
                    bankCode: bankCode,

                    service: 'Pawapay'
                });
            }
            user.withdrawalAccounts = [...user.withdrawalAccounts, withdrawalAccount];
            user.save();
            return res.status(200).json({data: withdrawalAccount, success: true});
        }

    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

// @desc get paystack banks
// @route GET /api/v1/payouts/banks
exports.getPaystackBanks = async (req, res) => {
    try {
        const response = await axios.get(`https://api.paystack.co/bank`, {
            params: {currency: req.query.currency},
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });
        return res.status(200).json({
            success: true,
            data: response.data.data,
        });
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

// @desc get paystack banks
// @route POST /api/v1/payouts/configs
exports.getPawapayConfigs = async (req, res) => {
    try {
        const response = await axios.get('https://api.sandbox.pawapay.cloud/active-conf', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.PAWAPAY_SECRET_KEY}`
            }
        });

        const data = response.data.countries.filter((country) => {

            return country?.correspondents?.some(correspondent => correspondent.currency === req.query.currency);
        })

        return res.status(200).json({
            data: data,
            success: true,
        })
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}


// @desc Get withdrawal account
// @route GET /api/v1/payouts/account/:id
exports.getWithdrawalAccount = async (req, res) => {
    try {

        const withdrawalAccount = await WithdrawalAccount.findById(req.params.id);
        return res.status(200).json({
            success: true,
            data: withdrawalAccount,
        })
    } catch (error) {

    }
}

// @desc get user withdrawal account
// @route GET /api/v1/payouts/accounts/:id
exports.getUserWithdrawalAccounts = async (req, res) => {
    try {
        const accounts = await WithdrawalAccount.find({userId: req.params.id}).exec();
        return res.status(200).json({
            data: accounts,
            success: true,
        })
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

// @desc delete withdrawal account
// @route DELETE /api/v1/payouts/account/:id
exports.deleteWithdrawalAccount = async (req, res) => {
    try {

    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

// @desc request payout
// @route POST /api/v1/payouts/create
exports.requestPayout = async (req, res) => {
    try {
        const {amount, currency, walletId, withdrawalAccountId, userId} = req.body;
        const payout = await Payout.create({amount, currency, walletId, withdrawalAccountId, userId, status: 'pending'})
        return res.status(200).json({
            data: payout,
            success: true,
        })
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

// @desc Get user payouts
// @route GET /api/v1/payouts/:id
exports.getPayouts = async (req, res) => {
    try {
        const payouts = await Payout.find({userId: req.params.id});
        return res.status(200).json({
            success: true,
            data: payouts,
        })
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}