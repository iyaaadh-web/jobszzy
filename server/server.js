const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Look for .env in root
require('dotenv').config(); // Fallback to current directory
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON body

// Serve static files from the uploads directory (for PDFs/Images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const adminRoutes = require('./routes/admin');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

// Root route for sanity check
app.get('/api/health', (req, res) => {
    res.send('Jobszzy API is running');
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
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

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'An unexpected error occurred on the server'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'not set (defaulting to development)'}`);
});
