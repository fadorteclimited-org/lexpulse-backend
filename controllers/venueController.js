const Venue = require('../models/venueModel');
const Event = require("../models/eventModel");
const cloudinary = require("../middleware/cloudinary");


// Add a new venue
exports.addVenue = async (req, res) => {
    const { name, street, city, district, country, links, capacity, type, description, phone, email,userId } = req.body;
    try {

        const result = async (path) => await cloudinary.uploader.upload(path);


        const files = req.files;

        const poster = await result(files['poster'][0].path);
        const imageUrls = [poster.secure_url];

        if (files['images'] && files['images'].length > 0) {
            const imageUploadPromises = files['images'].map(file => result(file.path));
            const uploadedImages = await Promise.all(imageUploadPromises);
            uploadedImages.forEach(upload => imageUrls.push(upload.secure_url));
        }

        const newVenue = new Venue({
            name,
            street,
            city,
            district,
            poster: poster.secure_url,
            images: imageUrls,
            links,
            country,
            capacity,
            type,
            description,
            phone,
            email,
            userId
        });

        const savedVenue = await newVenue.save();
        res.status(201).json({success: true,data: savedVenue});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to add venue' });
    }
};

// Search for venues
exports.searchVenues = async (req, res) => {
    const { term } = req.query;
    try {
        const venues = await Venue.find({
            $or: [
                { name: { $regex: term, $options: 'i' } },
                {street: { $regex: term, $options: 'i' } },
                {district: { $regex: term, $options: 'i' } },
                {type: { $regex: term, $options: 'i' } },
                { city: { $regex: term, $options: 'i' } },
                { country: { $regex: term, $options: 'i' } }
            ]
        });
        res.status(200).json({success: true,data:venues});
    } catch (error) {
        res.status(500).json({ error: 'Failed to search venues' });
    }
};

// Update a venue
exports.updateVenue = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedVenue = await Venue.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedVenue) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        res.status(200).json({success: true,data: updatedVenue});
    } catch (error) {
        res.status(500).json({ error: 'Failed to update venue' });
    }
};

// Get a single venue by id
exports.getVenue = async (req, res) => {
    const { id } = req.params;
    try {
        const venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        res.status(200).json({success: true,data: venue});
    } catch (error) {
        res.status(500).json({ error: 'Failed to get venue' });
    }
};

exports.getUserVenue = async (req, res) => {
    const userId = req.params.id;
    try {
        const venues = await Venue.find({ userId: userId });
        res.status(200).json({ success: true, data: venues });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get user venues' });
    }
}

exports.getVenueEvents = async (req, res) => {
    const venueId = req.params.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
        const events = await Event.find({
            'venue.saved': true,
            'venue.id': venueId,
            eventDate: { $gte: today },
        });
        return res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
}

// Delete a venue by id
exports.deleteVenue = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedVenue = await Venue.findByIdAndDelete(id);
        if (!deletedVenue) {
            return res.status(404).json({ error: 'Venue not found' });
        }
        res.status(200).json({success: true, message: 'Venue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete venue' });
    }
};