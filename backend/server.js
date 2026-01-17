const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const babyRoutes = require('./routes/baby');
const trackingRoutes = require('./routes/tracking');
const vaccinationRoutes = require('./routes/vaccination');
const aiRoutes = require('./routes/ai');
const nutritionRoutes = require('./routes/nutrition');
const analyticsRoutes = require('./routes/analytics');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for development
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carenest-ai', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

connectDB();

// Root route
app.get('/', (req, res) => {
    res.json({
        message: '🌸 CareNest AI - Maternal & Infant Care Platform API',
        version: '1.0.0',
        status: 'active',
        endpoints: {
            auth: '/api/auth',
            baby: '/api/baby',
            tracking: '/api/tracking',
            vaccination: '/api/vaccination',
            ai: '/api/ai',
            nutrition: '/api/nutrition',
            analytics: '/api/analytics'
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/baby', babyRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/vaccination', vaccinationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});
