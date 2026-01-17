const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    baby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Baby',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Physical', 'Social', 'Language', 'Cognitive', 'Self-Care'],
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    ageInMonths: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'pending', 'completed'],
        default: 'upcoming'
    },
    completedDate: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
milestoneSchema.index({ baby: 1, ageInMonths: 1 });
milestoneSchema.index({ baby: 1, status: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);
