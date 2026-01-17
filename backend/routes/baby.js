const express = require('express');
const router = express.Router();
const Baby = require('../models/Baby');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/baby
// @desc    Get all babies for current user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const babies = await Baby.find({ parent: req.user._id, isActive: true });
        res.json({
            success: true,
            count: babies.length,
            data: babies
        });
    } catch (error) {
        console.error('Error fetching babies:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching baby profiles'
        });
    }
});

// @route   POST /api/baby
// @desc    Create baby profile
// @access  Private
router.post('/', async (req, res) => {
    try {
        const babyData = {
            ...req.body,
            parent: req.user._id
        };

        const baby = await Baby.create(babyData);

        res.status(201).json({
            success: true,
            message: 'Baby profile created successfully',
            data: baby
        });
    } catch (error) {
        console.error('Error creating baby:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating baby profile'
        });
    }
});

// @route   GET /api/baby/:id
// @desc    Get single baby
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const baby = await Baby.findOne({
            _id: req.params.id,
            parent: req.user._id
        });

        if (!baby) {
            return res.status(404).json({
                success: false,
                message: 'Baby not found'
            });
        }

        res.json({
            success: true,
            data: baby
        });
    } catch (error) {
        console.error('Error fetching baby:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching baby profile'
        });
    }
});

// @route   PUT /api/baby/:id
// @desc    Update baby profile
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const baby = await Baby.findOneAndUpdate(
            {
                _id: req.params.id,
                parent: req.user._id
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!baby) {
            return res.status(404).json({
                success: false,
                message: 'Baby not found'
            });
        }

        res.json({
            success: true,
            message: 'Baby profile updated successfully',
            data: baby
        });
    } catch (error) {
        console.error('Error updating baby:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating baby profile'
        });
    }
});

// @route   DELETE /api/baby/:id
// @desc    Delete baby profile (soft delete)
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const baby = await Baby.findOneAndUpdate(
            {
                _id: req.params.id,
                parent: req.user._id
            },
            { isActive: false },
            { new: true }
        );

        if (!baby) {
            return res.status(404).json({
                success: false,
                message: 'Baby not found'
            });
        }

        res.json({
            success: true,
            message: 'Baby profile deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting baby:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting baby profile'
        });
    }
});

module.exports = router;
