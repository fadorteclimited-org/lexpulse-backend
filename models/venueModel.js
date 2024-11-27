const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    district: {
        type: String,
    },
    country: {
        type: String,
        required: true,
    },
    links: [
        {
            name: {
                type: String,
            },
            url: {
                type: String,
            }
        }
    ],
    followers: {
        type: Number,
        default: 0,
    },
    images: [{
        type: String,
    }],
    poster: {
        type: String,
    },
    capacity: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    yearEvents: {
        type: Number,
        default: 0,
    },
    description: {
        type: String,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

module.exports = mongoose.model('Venue', VenueSchema);