const mongoose = require('mongoose');

const sleepLogSchema = new mongoose.Schema({
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
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        default: null
    },
    duration: {
        type: Number, // in minutes
        default: null
    },
    quality: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', ''],
        default: ''
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Calculate duration before saving
sleepLogSchema.pre('save', function(next) {
    if (this.endTime && this.startTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
    }
    next();
});

sleepLogSchema.index({ baby: 1, startTime: -1 });

module.exports = mongoose.model('SleepLog', sleepLogSchema);
