const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Look for .env in root
require('dotenv').config(); // Fallback to current directory
const express = require('express');
const cors = require('cors');

// ERROR HANDLING: Catch crashes before they happen
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON body

// Serve static files from the uploads directory (for PDFs/Images)
app.use('/uploads', express.static(uploadsDir));

// Import Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const adminRoutes = require('./routes/admin');
const applicationRoutes = require('./routes/applications');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/public', require('./routes/public'));

// Root route for sanity check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        message: 'Jobszzy API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'production ') {
    // Set static folder
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));

    // FOOLPROOF CATCH-ALL FOR SPA
    app.use((req, res, next) => {
        if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
            return res.sendFile(path.join(distPath, 'index.html'));
        }
        next();
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running in development mode');
    });
}

// Global Error Handler for Express
app.use((err, req, res, next) => {
    console.error('Express Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`--- Jobszzy Backend Started ---`);
    console.log(`Port: ${PORT}`);
    console.log(`Env: ${process.env.NODE_ENV}`);
    console.log(`DB: ${path.resolve(__dirname, 'jobszzy.sqlite')}`);
});
