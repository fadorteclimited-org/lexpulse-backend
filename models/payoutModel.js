const mongoose = require('mongoose');


const PayoutSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected','completed','failed'],
        default: 'pending'
    },
    reason: {
        type: String,
    },
    transactionId: {
        type: String,
    },
    service: {
        type: String,
        enum: [' Pawapay', 'Paystack'],
    },
    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
    },
    withdrawalAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WithdrawalAccount',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});
module.exports = mongoose.model('Payout', PayoutSchema);