
const mongoose = require('mongoose');

const ScannerSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Event'
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    activated: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true
    },
    scannedTickets: {
        type: Number,
        default: 0
    }
});


module.exports = mongoose.model('Scanner', ScannerSchema);
;