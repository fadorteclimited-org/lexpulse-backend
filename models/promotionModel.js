const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    eventHostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    promotionLevel: {
        type: String,
        required: true,
        unique: true,
    },
    startDate: {type: Date, default: Date.now},
    endDate: {
        type: Date,
        required: true,
    },
    country: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Promotion', PromotionSchema);