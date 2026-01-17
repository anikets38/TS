const express = require('express');
const router = express.Router();
const FeedingLog = require('../models/FeedingLog');
const SleepLog = require('../models/SleepLog');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// ===========================
// FEEDING LOGS
// ===========================

// @route   GET /api/tracking/feeding/:babyId
// @desc    Get feeding logs for a baby
// @access  Private
router.get('/feeding/:babyId', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        console.log('Feeding query - Baby ID:', req.params.babyId);
        console.log('Feeding query - Date range:', startDate, 'to', endDate);
        
        const query = {
            baby: req.params.babyId,
            parent: req.user._id
        };

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.time = {
                $gte: start,
                $lte: end
            };
            console.log('Feeding query - Time range:', start, 'to', end);
        }

        const logs = await FeedingLog.find(query).sort({ time: -1 });
        
        console.log('Feeding logs found:', logs.length);

        res.json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching feeding logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching feeding logs'
        });
    }
});

// @route   POST /api/tracking/feeding
// @desc    Create feeding log
// @access  Private
router.post('/feeding', async (req, res) => {
    try {
        const logData = {
            ...req.body,
            parent: req.user._id
        };

        const log = await FeedingLog.create(logData);

        res.status(201).json({
            success: true,
            message: 'Feeding log created successfully',
            data: log
        });
    } catch (error) {
        console.error('Error creating feeding log:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating feeding log'
        });
    }
});

// @route   PUT /api/tracking/feeding/:id
// @desc    Update feeding log
// @access  Private
router.put('/feeding/:id', async (req, res) => {
    try {
        const log = await FeedingLog.findOneAndUpdate(
            {
                _id: req.params.id,
                parent: req.user._id
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Feeding log not found'
            });
        }

        res.json({
            success: true,
            message: 'Feeding log updated successfully',
            data: log
        });
    } catch (error) {
        console.error('Error updating feeding log:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating feeding log'
        });
    }
});

// @route   DELETE /api/tracking/feeding/:id
// @desc    Delete feeding log
// @access  Private
router.delete('/feeding/:id', async (req, res) => {
    try {
        const log = await FeedingLog.findOneAndDelete({
            _id: req.params.id,
            parent: req.user._id
        });

        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Feeding log not found'
            });
        }

        res.json({
            success: true,
            message: 'Feeding log deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting feeding log:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting feeding log'
        });
    }
});

// ===========================
// SLEEP LOGS
// ===========================

// @route   GET /api/tracking/sleep/:babyId
// @desc    Get sleep logs for a baby
// @access  Private
router.get('/sleep/:babyId', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        console.log('Sleep query - Baby ID:', req.params.babyId);
        console.log('Sleep query - Date range:', startDate, 'to', endDate);
        
        const query = {
            baby: req.params.babyId,
            parent: req.user._id
        };

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.startTime = {
                $gte: start,
                $lte: end
            };
            console.log('Sleep query - Time range:', start, 'to', end);
        }

        const logs = await SleepLog.find(query).sort({ startTime: -1 });
        
        console.log('Sleep logs found:', logs.length);

        res.json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching sleep logs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sleep logs'
        });
    }
});

// @route   POST /api/tracking/sleep
// @desc    Create sleep log
// @access  Private
router.post('/sleep', async (req, res) => {
    try {
        const logData = {
            ...req.body,
            parent: req.user._id
        };

        const log = await SleepLog.create(logData);

        res.status(201).json({
            success: true,
            message: 'Sleep log created successfully',
            data: log
        });
    } catch (error) {
        console.error('Error creating sleep log:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating sleep log'
        });
    }
});

// @route   PUT /api/tracking/sleep/:id
// @desc    Update sleep log
// @access  Private
router.put('/sleep/:id', async (req, res) => {
    try {
        const log = await SleepLog.findOneAndUpdate(
            {
                _id: req.params.id,
                parent: req.user._id
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Sleep log not found'
            });
        }

        res.json({
            success: true,
            message: 'Sleep log updated successfully',
            data: log
        });
    } catch (error) {
        console.error('Error updating sleep log:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating sleep log'
        });
    }
});

// @route   DELETE /api/tracking/sleep/:id
// @desc    Delete sleep log
// @access  Private
router.delete('/sleep/:id', async (req, res) => {
    try {
        const log = await SleepLog.findOneAndDelete({
            _id: req.params.id,
            parent: req.user._id
        });

        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Sleep log not found'
            });
        }

        res.json({
            success: true,
            message: 'Sleep log deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting sleep log:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting sleep log'
        });
    }
});

// ===========================
// SUMMARY ENDPOINTS
// ===========================

// @route   GET /api/tracking/summary/:babyId
// @desc    Get today's summary for dashboard
// @access  Private
router.get('/summary/:babyId', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's feeding logs
        const feedingLogs = await FeedingLog.find({
            baby: req.params.babyId,
            parent: req.user._id,
            time: { $gte: today, $lt: tomorrow }
        });

        // Get today's sleep logs
        const sleepLogs = await SleepLog.find({
            baby: req.params.babyId,
            parent: req.user._id,
            startTime: { $gte: today, $lt: tomorrow }
        });

        // Calculate totals
        const totalFeedings = feedingLogs.length;
        const totalSleepMinutes = sleepLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
        const totalSleepHours = (totalSleepMinutes / 60).toFixed(1);

        res.json({
            success: true,
            data: {
                date: today,
                feeding: {
                    total: totalFeedings,
                    logs: feedingLogs
                },
                sleep: {
                    totalMinutes: totalSleepMinutes,
                    totalHours: parseFloat(totalSleepHours),
                    logs: sleepLogs
                }
            }
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching summary'
        });
    }
});

module.exports = router;
