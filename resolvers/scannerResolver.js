const Scanner = require('../models/scannerModel');

async function createScanner(_, { input }) {
    try {
        const scanner = new Scanner(input);
        await scanner.save();
        return scanner;
    } catch (error) {
        throw new Error("Error creating scanner: " + error.message);
    }
}

async function updateScanner(_, { id, input }) {
    try {
        const scanner = await Scanner.findByIdAndUpdate(id, input, { new: true });
        if (!scanner) {
            throw new Error("Scanner not found");
        }
        return scanner;
    } catch (error) {
        throw new Error("Error updating scanner: " + error.message);
    }
}

async function deleteScanner(_, { id }) {
    try {
        const scanner = await Scanner.findByIdAndDelete(id);
        if (!scanner) {
            throw new Error("Scanner not found");
        }
        return scanner;
    } catch (error) {
        throw new Error("Error deleting scanner: " + error.message);
    }
}

async function scanner(_, { id }) {
    try {
        const scanner = await Scanner.findById(id);
        if (!scanner) {
            throw new Error("Scanner not found");
        }
        return scanner;
    } catch (error) {
        throw new Error("Error fetching scanner: " + error.message);
    }
}

async function scanners() {
    try {
        const scanners = await Scanner.find();
        return scanners;
    } catch (error) {
        throw new Error("Error fetching scanners: " + error.message);
    }
}

module.exports = {
    Mutation: {
        createScanner,
        updateScanner,
        deleteScanner
    },
    Query: {
        scanner,
        scanners
    }
};