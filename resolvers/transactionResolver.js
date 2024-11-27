const Transaction = require('../models/transactionModel');

async function createTransaction(_, { input }) {
    try {
        const transaction = new Transaction(input);
        await transaction.save();
        return transaction;
    } catch (error) {
        throw new Error("Error creating transaction: " + error.message);
    }
}

async function updateTransaction(_, { id, input }) {
    try {
        const transaction = await Transaction.findByIdAndUpdate(id, input, { new: true });
        if (!transaction) {
            throw new Error("Transaction not found");
        }
        return transaction;
    } catch (error) {
        throw new Error("Error updating transaction: " + error.message);
    }
}

async function deleteTransaction(_, { id }) {
    try {
        const transaction = await Transaction.findByIdAndDelete(id);
        if (!transaction) {
            throw new Error("Transaction not found");
        }
        return transaction;
    } catch (error) {
        throw new Error("Error deleting transaction: " + error.message);
    }
}

async function transaction(_, { id }) {
    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            throw new Error("Transaction not found");
        }
        return transaction;
    } catch (error) {
        throw new Error("Error fetching transaction: " + error.message);
    }
}

async function transactions() {
    try {
        const transactions = await Transaction.find();
        return transactions;
    } catch (error) {
        throw new Error("Error fetching transactions: " + error.message);
    }
}
async function getEventTransactions(_, { id }) {
    try {
        const transactions = await Transaction.find({eventId: id}).populate('attendeeId').exec();


        return transactions.map(transaction => ({
            ...transaction.toJSON(),
            attendeeId: transaction.attendeeId._id,
            user: transaction.attendeeId
        }));
    } catch (e) {

    }
}
module.exports = {
    Mutation: {
        createTransaction,
        updateTransaction,
        deleteTransaction,
    },
    Query: {
        transaction,
        transactions,
        getEventTransactions,
    }
};