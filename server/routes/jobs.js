const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../database');
const { verifyToken, isEmployerOrAdmin, isAdmin } = require('../middleware/auth');

// Setup Multer for PDF Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store in the server/uploads directory
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-random-filename.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET all jobs
router.get('/', (req, res) => {
    db.all(`SELECT * FROM jobs ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// GET a specific job
router.get('/:id', (req, res) => {
    db.get(`SELECT * FROM jobs WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Job not found' });
        res.json(row);
    });
});

// POST a new job (Protected: Employer/Admin only, Handles PDF upload)
router.post('/', verifyToken, isEmployerOrAdmin, upload.single('job_pdf'), (req, res) => {
    const { title, company, location, type, salary, description, color } = req.body;
    const employer_id = req.user.id;

    // Create a URL path for the file if it was uploaded
    const pdf_url = req.file ? `/uploads/${req.file.filename}` : null;
    const posted_time = 'Just now'; // Simplified for prototype
    const jobColor = color || '#3b82f6';

    if (!title || !company || !location || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    db.run(
        `INSERT INTO jobs (title, company, location, type, salary, description, employer_id, pdf_url, posted_time, color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, company, location, type, salary, description, employer_id, pdf_url, posted_time, jobColor],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({
                message: 'Job posted successfully',
                id: this.lastID,
                pdf_url
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

        // Delete the job
        db.run(`DELETE FROM jobs WHERE id = ?`, [jobId], function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Job deleted successfully' });
        });
    });
});

module.exports = router;
