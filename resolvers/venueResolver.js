const Venue = require('../models/venueModel');

async function createVenue(_, { input }) {
    try {
        const venue = new Venue(input);
        await venue.save();
        return venue;
    } catch (error) {
        throw new Error("Error creating venue: " + error.message);
    }
}

async function updateVenue(_, { id, input }) {
    try {
        const venue = await Venue.findByIdAndUpdate(id, input, { new: true });
        if (!venue) {
            throw new Error("Venue not found");
        }
        return venue;
    } catch (error) {
        throw new Error("Error updating venue: " + error.message);
    }
}

async function deleteVenue(_, { id }) {
    try {
        const venue = await Venue.findByIdAndDelete(id);
        if (!venue) {
            throw new Error("Venue not found");
        }
        return venue;
    } catch (error) {
        throw new Error("Error deleting venue: " + error.message);
    }
}

async function venue(_, { id }) {
    try {
        const venue = await Venue.findById(id);
        if (!venue) {
            throw new Error("Venue not found");
        }
        return venue;
    } catch (error) {
        throw new Error("Error fetching venue: " + error.message);
    }
}

async function venues() {
    try {
        const venues = await Venue.find();
        return venues;
    } catch (error) {
        throw new Error("Error fetching venues: " + error.message);
    }
}

module.exports = {
    Mutation: {
        createVenue,
        updateVenue,
        deleteVenue
    },
    Query: {
        venue,
        venues
    }
};