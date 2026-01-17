const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    recommendedAge: {
        type: Number, // in weeks
        required: true
    },
    scheduledDate: {
        type: Date,
        default: null
    },
    completedDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'completed', 'missed'],
        default: 'pending'
    },
    administeredBy: {
        type: String,
        trim: true
    },
    batchNumber: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    reminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

vaccinationSchema.index({ baby: 1, recommendedAge: 1 });
vaccinationSchema.index({ scheduledDate: 1, status: 1 });

module.exports = mongoose.model('Vaccination', vaccinationSchema);
