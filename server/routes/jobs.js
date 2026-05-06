const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../database');
const { verifyToken, isEmployerOrAdmin, isAdmin } = require('../middleware/auth');

// Setup Multer for PDF Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-random-filename.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and Image files (JPG/PNG) are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET all jobs (supports ?category= filter)
router.get('/', (req, res) => {
    const { category } = req.query;
    let query = `SELECT jobs.*, users.logo_url 
         FROM jobs 
         LEFT JOIN users ON jobs.employer_id = users.id`;
    const params = [];

    if (category) {
        query += ` WHERE jobs.category = ? AND jobs.status = 'active'`;
        params.push(category);
    } else {
        query += ` WHERE jobs.status = 'active'`;
    }

    query += ` ORDER BY jobs.id DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// GET a specific job
router.get('/:id', (req, res) => {
    db.get(
        `SELECT jobs.*, users.logo_url 
         FROM jobs 
         LEFT JOIN users ON jobs.employer_id = users.id 
         WHERE jobs.id = ?`,
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!row) return res.status(404).json({ error: 'Job not found' });
            res.json(row);
        }
    );
});

// POST a new job (Protected: Employer/Admin only, Handles PDF/Image upload)
router.post('/', verifyToken, isEmployerOrAdmin, upload.fields([{ name: 'job_pdf', maxCount: 1 }, { name: 'job_poster', maxCount: 1 }]), (req, res) => {
    const { title, company, location, type, salary, description, color, category, is_urgent, deadline } = req.body;
    const employer_id = req.user.id;

    // Handle files
    const pdf_url = req.files['job_pdf'] ? `/uploads/${req.files['job_pdf'][0].filename}` : null;
    const poster_url = req.files['job_poster'] ? `/uploads/${req.files['job_poster'][0].filename}` : null;
    
    const posted_time = 'Just now'; // Simplified for prototype
    const jobColor = color || '#3b82f6';
    const jobCategory = category || 'general';
    const urgentStatus = is_urgent ? 1 : 0;

    if (!title || !company || !location || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
        `INSERT INTO jobs (title, company, location, type, salary, description, employer_id, pdf_url, poster_url, posted_time, color, category, is_urgent, deadline)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, company, location, type, salary, description, employer_id, pdf_url, poster_url, posted_time, jobColor, jobCategory, urgentStatus, deadline],
        function (err) {
            if (err) {
                console.error('Error inserting job:', err.message);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({
                message: 'Job posted successfully',
                id: this.lastID,
                pdf_url,
                poster_url
            });
        }
    );
});

// DELETE a job (Protected: Admin or Owner)
router.delete('/:id', verifyToken, (req, res) => {
    const jobId = req.params.id;

    // First, verify the job exists and check ownership if not admin
    db.get(`SELECT * FROM jobs WHERE id = ?`, [jobId], (err, job) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!job) return res.status(404).json({ error: 'Job not found' });

        if (req.user.role !== 'admin' && job.employer_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied: You do not own this job posting' });
        }

        // Soft delete the job by marking it as 'deleted'
        db.run(`UPDATE jobs SET status = 'deleted' WHERE id = ?`, [jobId], function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Job marked as deleted successfully' });
        });
    });
});

module.exports = router;
