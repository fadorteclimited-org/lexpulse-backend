const mongoose = require('mongoose');


const WalletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    prevBalance: {
        type: Number,
        required: true,
        default: 0,
    },
    pendingBalance: {
        type: Number,
        required: true,
        default: 0,
    },
    pendingPrevBalance: {
        type: Number,
        required: true,
        default: 0,
    },
    currency: {
        type: String,
        required: true,
        default: 'GHS',
    }
});

module.exports =mongoose.model('Wallet', WalletSchema);