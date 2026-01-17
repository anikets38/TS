const mongoose = require('mongoose');

const feedingLogSchema = new mongoose.Schema({
    baby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Baby',
        required: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['breast', 'formula', 'solid', 'water'],
        required: true
    },
    time: {
        type: Date,
        required: true,
        default: Date.now
    },
    quantity: {
        type: Number, // in ml or grams
        default: null
    },
    duration: {
        type: Number, // in minutes (for breastfeeding)
        default: null
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

feedingLogSchema.index({ baby: 1, time: -1 });

module.exports = mongoose.model('FeedingLog', feedingLogSchema);
