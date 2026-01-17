const mongoose = require('mongoose');

const babySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide baby name'],
        trim: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please provide date of birth']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: [true, 'Please provide gender']
    },
    weight: {
        type: Number, // in kg
        default: null
    },
    height: {
        type: Number, // in cm
        default: null
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: ''
    },
    allergies: [{
        type: String,
        trim: true
    }],
    medicalConditions: [{
        type: String,
        trim: true
    }],
    photo: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Calculate age in months
babySchema.virtual('ageInMonths').get(function() {
    const now = new Date();
    const dob = new Date(this.dateOfBirth);
    const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    return months;
});

// Calculate age in weeks
babySchema.virtual('ageInWeeks').get(function() {
    const now = new Date();
    const dob = new Date(this.dateOfBirth);
    const weeks = Math.floor((now - dob) / (1000 * 60 * 60 * 24 * 7));
    return weeks;
});

babySchema.set('toJSON', { virtuals: true });
babySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Baby', babySchema);
