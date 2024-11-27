const Wallet = require('../models/walletModel');

async function createWallet(_, { input }) {
    try {
        const wallet = new Wallet(input);
        await wallet.save();
        return wallet;
    } catch (error) {
        throw new Error("Error creating wallet: " + error.message);
    }
}

async function updateWallet(_, { id, input }) {
    try {
        const wallet = await Wallet.findByIdAndUpdate(id, input, { new: true });
        if (!wallet) {
            throw new Error("Wallet not found");
        }
        return wallet;
    } catch (error) {
        throw new Error("Error updating wallet: " + error.message);
    }
}

async function deleteWallet(_, { id }) {
    try {
        const wallet = await Wallet.findByIdAndDelete(id);
        if (!wallet) {
            throw new Error("Wallet not found");
        }
        return wallet;
    } catch (error) {
        throw new Error("Error deleting wallet: " + error.message);
    }
}

async function wallet(_, { id }) {
    try {
        const wallet = await Wallet.findById(id);
        if (!wallet) {
            throw new Error("Wallet not found");
        }
        return wallet;
    } catch (error) {
        throw new Error("Error fetching wallet: " + error.message);
    }
}

async function wallets() {
    try {
        const wallets = await Wallet.find();
        return wallets;
    } catch (error) {
        throw new Error("Error fetching wallets: " + error.message);
    }
}

async function getUserWallets(_, { id }) {
    try {
        const wallet = await Wallet.find({ userId: id}).exec();
        return wallet;
    } catch (error) {
        throw new Error("Error fetching wallets: " + error.message);
    }
}

module.exports = {
    Mutation: {
        createWallet,
        updateWallet,
        deleteWallet
    },
    Query: {
        wallet,
        wallets,
        getUserWallets,
    }
};