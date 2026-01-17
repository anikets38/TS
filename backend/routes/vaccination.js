const express = require('express');
const router = express.Router();
const Vaccination = require('../models/Vaccination');
const Baby = require('../models/Baby');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route   GET /api/vaccination/:babyId
// @desc    Get all vaccinations for a baby
// @access  Private
router.get('/:babyId', async (req, res) => {
    try {
        const vaccinations = await Vaccination.find({
            baby: req.params.babyId,
            parent: req.user._id
        }).sort({ recommendedAge: 1 });

        res.json({
            success: true,
            count: vaccinations.length,
            data: vaccinations
        });
    } catch (error) {
        console.error('Error fetching vaccinations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching vaccinations'
        });
    }
});

// @route   POST /api/vaccination/initialize/:babyId
// @desc    Initialize vaccination schedule for a baby
// @access  Private
router.post('/initialize/:babyId', async (req, res) => {
    try {
        // Verify baby belongs to user
        const baby = await Baby.findOne({
            _id: req.params.babyId,
            parent: req.user._id
        });

        if (!baby) {
            return res.status(404).json({
                success: false,
                message: 'Baby not found'
            });
        }

        // Standard vaccination schedule
        const vaccineSchedule = [
            { name: 'BCG', description: 'Bacillus Calmette-Guérin (Tuberculosis)', age: 0 },
            { name: 'Hepatitis B - Birth Dose', description: 'First dose at birth', age: 0 },
            { name: 'OPV 0', description: 'Oral Polio Vaccine (Birth dose)', age: 0 },
            { name: 'Hepatitis B - 1', description: 'First dose after birth', age: 6 },
            { name: 'DTP 1', description: 'Diphtheria, Tetanus, Pertussis', age: 6 },
            { name: 'IPV 1', description: 'Inactivated Polio Vaccine', age: 6 },
            { name: 'Hib 1', description: 'Haemophilus influenzae type B', age: 6 },
            { name: 'PCV 1', description: 'Pneumococcal Conjugate Vaccine', age: 6 },
            { name: 'Rotavirus 1', description: 'Rotavirus Vaccine', age: 6 },
            { name: 'Hepatitis B - 2', description: 'Second dose', age: 10 },
            { name: 'DTP 2', description: 'Second dose', age: 10 },
            { name: 'IPV 2', description: 'Second dose', age: 10 },
            { name: 'Hib 2', description: 'Second dose', age: 10 },
            { name: 'PCV 2', description: 'Second dose', age: 10 },
            { name: 'Rotavirus 2', description: 'Second dose', age: 10 },
            { name: 'Hepatitis B - 3', description: 'Third dose', age: 14 },
            { name: 'DTP 3', description: 'Third dose', age: 14 },
            { name: 'IPV 3', description: 'Third dose', age: 14 },
            { name: 'Hib 3', description: 'Third dose', age: 14 },
            { name: 'PCV 3', description: 'Third dose', age: 14 },
            { name: 'Rotavirus 3', description: 'Third dose', age: 14 },
            { name: 'MMR 1', description: 'Measles, Mumps, Rubella (1 year)', age: 52 },
            { name: 'Varicella 1', description: 'Chickenpox (1 year)', age: 52 },
        ];

        // Create vaccination records
        const vaccinations = await Vaccination.insertMany(
            vaccineSchedule.map(vaccine => ({
                baby: baby._id,
                parent: req.user._id,
                name: vaccine.name,
                description: vaccine.description,
                recommendedAge: vaccine.age,
                status: baby.ageInWeeks > vaccine.age ? 'pending' : 'pending'
            }))
        );

        res.status(201).json({
            success: true,
            message: 'Vaccination schedule initialized successfully',
            count: vaccinations.length,
            data: vaccinations
        });
    } catch (error) {
        console.error('Error initializing vaccinations:', error);
        res.status(500).json({
            success: false,
            message: 'Error initializing vaccination schedule'
        });
    }
});

// @route   POST /api/vaccination
// @desc    Add custom vaccination
// @access  Private
router.post('/', async (req, res) => {
    try {
        const vaccinationData = {
            ...req.body,
            parent: req.user._id
        };

        const vaccination = await Vaccination.create(vaccinationData);

        res.status(201).json({
            success: true,
            message: 'Vaccination added successfully',
            data: vaccination
        });
    } catch (error) {
        console.error('Error adding vaccination:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding vaccination'
        });
    }
});

// @route   PUT /api/vaccination/:id
// @desc    Update vaccination
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const vaccination = await Vaccination.findOneAndUpdate(
            {
                _id: req.params.id,
                parent: req.user._id
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!vaccination) {
            return res.status(404).json({
                success: false,
                message: 'Vaccination not found'
            });
        }

        res.json({
            success: true,
            message: 'Vaccination updated successfully',
            data: vaccination
        });
    } catch (error) {
        console.error('Error updating vaccination:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating vaccination'
        });
    }
});

// @route   PUT /api/vaccination/:id/complete
// @desc    Mark vaccination as completed
// @access  Private
router.put('/:id/complete', async (req, res) => {
    try {
        const { completedDate, administeredBy, batchNumber, notes } = req.body;

        const vaccination = await Vaccination.findOneAndUpdate(
            {
                _id: req.params.id,
                parent: req.user._id
            },
            {
                status: 'completed',
                completedDate: completedDate || new Date(),
                administeredBy,
                batchNumber,
                notes
            },
            { new: true }
        );

        if (!vaccination) {
            return res.status(404).json({
                success: false,
                message: 'Vaccination not found'
            });
        }

        res.json({
            success: true,
            message: 'Vaccination marked as completed',
            data: vaccination
        });
    } catch (error) {
        console.error('Error completing vaccination:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing vaccination'
        });
    }
});

// @route   GET /api/vaccination/upcoming/:babyId
// @desc    Get upcoming vaccinations
// @access  Private
router.get('/upcoming/:babyId', async (req, res) => {
    try {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

        const upcoming = await Vaccination.find({
            baby: req.params.babyId,
            parent: req.user._id,
            status: { $in: ['pending', 'scheduled'] },
            scheduledDate: { $lte: threeDaysFromNow }
        }).sort({ scheduledDate: 1 });

        res.json({
            success: true,
            count: upcoming.length,
            data: upcoming
        });
    } catch (error) {
        console.error('Error fetching upcoming vaccinations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming vaccinations'
        });
    }
});

module.exports = router;
