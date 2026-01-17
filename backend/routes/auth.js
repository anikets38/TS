const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'default-secret-key', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating user'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                careMode: user.careMode
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
        
        // Find user
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                careMode: user.careMode,
                expectedDueDate: user.expectedDueDate,
                lmpDate: user.lastPeriodDate,
                lastPeriodDate: user.lastPeriodDate,
                cycleLength: user.cycleLength,
                periodDuration: user.periodDuration
            }
        });
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }
});

// @route   PUT /api/auth/mode
// @desc    Update user care mode
// @access  Private
router.put('/mode', async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
        
        const { careMode, expectedDueDate, lmpDate, lastPeriodDate, cycleLength, periodDuration, conceptionDate } = req.body;

        // Validate care mode
        const validModes = ['planning', 'pregnancy', 'baby-care'];
        if (!careMode) {
            return res.status(400).json({
                success: false,
                message: 'Care mode is required'
            });
        }
        if (!validModes.includes(careMode)) {
            return res.status(400).json({
                success: false,
                message: `Invalid care mode: "${careMode}". Must be one of: ${validModes.join(', ')}`
            });
        }

        // Update user
        const updateData = { careMode };
        
        // Handle pregnancy data - accept both lmpDate and lastPeriodDate
        if (lmpDate || lastPeriodDate) {
            updateData.lastPeriodDate = lmpDate || lastPeriodDate;
        }
        if (expectedDueDate) {
            updateData.expectedDueDate = expectedDueDate;
        }
        if (cycleLength) {
            updateData.cycleLength = cycleLength;
        }
        if (periodDuration) {
            updateData.periodDuration = periodDuration;
        }

        const user = await User.findByIdAndUpdate(
            decoded.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Care mode updated successfully',
            data: {
                careMode: user.careMode,
                expectedDueDate: user.expectedDueDate,
                lmpDate: user.lastPeriodDate,
                lastPeriodDate: user.lastPeriodDate,
                cycleLength: user.cycleLength,
                periodDuration: user.periodDuration
            }
        });
    } catch (error) {
        console.error('Mode update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating care mode'
        });
    }
});

module.exports = router;
