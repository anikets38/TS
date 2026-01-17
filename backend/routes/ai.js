const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const FeedingLog = require('../models/FeedingLog');
const SleepLog = require('../models/SleepLog');
const Vaccination = require('../models/Vaccination');

// All routes are protected
router.use(protect);

// N8N Webhook URLs for different modes
const N8N_CHATBOT_URL = process.env.N8N_CHATBOT_URL || 'http://localhost:5678/webhook/tinystep-chatbot';

// @route   POST /api/ai/chat
// @desc    Send message to AI chatbot via n8n webhook
// @access  Private (or public with context)
router.post('/chat', async (req, res) => {
    try {
        const { message, context, conversationHistory } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get user ID from auth or use anonymous
        const userId = req.user?._id?.toString() || 'anonymous';

        // Prepare payload for n8n webhook
        const payload = {
            userId: userId,
            userName: req.user?.name || 'Guest',
            message: message,
            context: context || {},
            conversationHistory: conversationHistory || [],
            timestamp: new Date().toISOString()
        };

        try {
            const response = await axios.post(N8N_CHATBOT_URL, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 seconds timeout
            });

            res.json({
                success: true,
                data: response.data?.data || response.data
            });

        } catch (n8nError) {
            console.error('N8N webhook error:', n8nError.message);
            
            // Fallback response if n8n is unavailable
            res.json({
                success: true,
                data: {
                    response: "I'm currently experiencing technical difficulties. Please try again in a moment. For urgent concerns, please consult with your healthcare provider.",
                    fallback: true
                }
            });
        }

    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing chat request'
        });
    }
});

// @route   POST /api/ai/summary
// @desc    Get AI-generated summary of baby's routine
// @access  Private
router.post('/summary', async (req, res) => {
    try {
        const { babyId, date } = req.body;

        // Get today's data
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Fetch feeding logs
        const feedingLogs = await FeedingLog.find({
            baby: babyId,
            parent: req.user._id,
            time: { $gte: targetDate, $lt: nextDay }
        }).sort({ time: 1 });

        // Fetch sleep logs
        const sleepLogs = await SleepLog.find({
            baby: babyId,
            parent: req.user._id,
            startTime: { $gte: targetDate, $lt: nextDay }
        }).sort({ startTime: 1 });

        // Prepare context for AI
        const context = {
            userId: req.user._id.toString(),
            babyId,
            date: targetDate.toISOString(),
            feeding: {
                total: feedingLogs.length,
                logs: feedingLogs.map(log => ({
                    type: log.type,
                    time: log.time,
                    quantity: log.quantity,
                    duration: log.duration
                }))
            },
            sleep: {
                total: sleepLogs.length,
                totalHours: (sleepLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / 60).toFixed(1),
                logs: sleepLogs.map(log => ({
                    startTime: log.startTime,
                    endTime: log.endTime,
                    duration: log.duration,
                    quality: log.quality
                }))
            }
        };

        // Send to n8n for AI summary
        const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/carebuddy-agent';
        
        try {
            const response = await axios.post(n8nUrl, {
                action: 'summarize',
                ...context
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });

            res.json({
                success: true,
                data: {
                    summary: response.data.summary || response.data.message,
                    context,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (n8nError) {
            console.error('n8n summary error:', n8nError.message);
            
            // Fallback summary
            const totalFeedings = feedingLogs.length;
            const totalSleepHours = (sleepLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / 60).toFixed(1);
            
            res.json({
                success: true,
                data: {
                    summary: `Today's summary: ${totalFeedings} feedings and ${totalSleepHours} hours of sleep recorded. Everything looks good!`,
                    context,
                    fallback: true,
                    timestamp: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating summary'
        });
    }
});

// @route   GET /api/ai/next-vaccine/:babyId
// @desc    Get next vaccination info
// @access  Private
router.get('/next-vaccine/:babyId', async (req, res) => {
    try {
        const nextVaccine = await Vaccination.findOne({
            baby: req.params.babyId,
            parent: req.user._id,
            status: { $in: ['pending', 'scheduled'] }
        }).sort({ recommendedAge: 1, scheduledDate: 1 });

        if (!nextVaccine) {
            return res.json({
                success: true,
                data: {
                    message: 'All vaccinations are up to date! 🎉',
                    nextVaccine: null
                }
            });
        }

        res.json({
            success: true,
            data: {
                message: `Next vaccine: ${nextVaccine.name}${nextVaccine.scheduledDate ? ` scheduled on ${nextVaccine.scheduledDate.toLocaleDateString()}` : ''}`,
                nextVaccine
            }
        });
    } catch (error) {
        console.error('Next vaccine error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching next vaccine'
        });
    }
});

module.exports = router;
