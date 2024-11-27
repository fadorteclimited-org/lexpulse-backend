const User = require('../models/userModel');
const { Error } = require("mongoose");

async function user(_, { id }) {
    try {
        return await User.findById(id);
    } catch (e) {
        // Handle error
    }
}

async function users(_) {
    try {
        return await User.find().sort({ createdAt: -1 });
    } catch (e) {
        // Handle error
    }
}

async function getHosts(_) {
    try {
        return await User.find({ userType: 'host' }).exec();
    } catch (e) {
        throw new Error('Failed to fetch hosts');
    }
}

async function createUser(_, { input }) {
    try {
        const user = new User(input);
        await user.save();
        return user;
    } catch (error) {
        throw new Error("Error creating user: " + error.message);
    }
}

async function updateUser(_, { id, input }) {
    try {
        const user = await User.findByIdAndUpdate(id, input, { new: true });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        throw new Error("Error updating user: " + error.message);
    }
}

async function deleteUser(_, { id }) {
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        throw new Error("Error deleting user: " + error.message);
    }
}

module.exports = {
    User: {
        id: (parent) => parent._id.toString(),
        createdAt: (parent) => new Date(parent.createdAt).toISOString(),
    },
    Query: {
        user,
        users,
        getHosts,
    },
    Mutation: {
        createUser,
        updateUser,
        deleteUser
    }
};