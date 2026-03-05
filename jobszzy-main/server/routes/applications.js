const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');

// Apply for a job (Seeker only)
router.post('/', verifyToken, (req, res) => {
    const { job_id, cover_letter } = req.body;
    const seeker_id = req.user.id;

    if (req.user.role !== 'seeker') {
        return res.status(403).json({ error: 'Only job seekers can apply for jobs' });
    }

    if (!job_id) {
        return res.status(400).json({ error: 'Job ID is required' });
    }

    // First check if already applied
    db.get('SELECT id FROM applications WHERE job_id = ? AND seeker_id = ?', [job_id, seeker_id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (row) return res.status(400).json({ error: 'You have already applied for this job' });

        // Get seeker's CV from user profile
        db.get('SELECT cv_url FROM users WHERE id = ?', [seeker_id], (err, user) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            db.run(
                'INSERT INTO applications (job_id, seeker_id, cover_letter, cv_url) VALUES (?, ?, ?, ?)',
                [job_id, seeker_id, cover_letter, user.cv_url],
                function (err) {
                    if (err) return res.status(500).json({ error: 'Database error' });

                    const appId = this.lastID;

                    // NOTIFY EMPLOYER
                    db.get('SELECT employer_id, title FROM jobs WHERE id = ?', [job_id], (err, job) => {
                        if (!err && job) {
                            const message = `New application received for "${job.title}" from ${req.user.name || 'a job seeker'}.`;
                            db.run(
                                'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
                                [job.employer_id, message, 'application']
                            );
                        }
                    });

                    res.status(201).json({ message: 'Application submitted successfully', id: appId });
                }
            );
        });
    });
});

// Get my applications (Seeker)
router.get('/my-applications', verifyToken, (req, res) => {
    if (req.user.role !== 'seeker') {
        return res.status(403).json({ error: 'Only job seekers can view their history' });
    }

    db.all(`
        SELECT a.*, j.title, j.company, j.location
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE a.seeker_id = ?
        ORDER BY a.applied_at DESC
    `, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Get applicants for a job (Employer/Admin)
router.get('/job/:jobId', verifyToken, (req, res) => {
    const jobId = req.params.jobId;

    // Verify ownership or admin
    db.get('SELECT employer_id FROM jobs WHERE id = ?', [jobId], (err, job) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!job) return res.status(404).json({ error: 'Job not found' });

        if (req.user.role !== 'admin' && job.employer_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        db.all(`
            SELECT a.*, u.name as seeker_name, u.email as seeker_email
            FROM applications a
            JOIN users u ON a.seeker_id = u.id
            WHERE a.job_id = ?
            ORDER BY a.applied_at DESC
        `, [jobId], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(rows);
        });
    });
});

// Update application status (Employer/Admin)
router.put('/:id/status', verifyToken, (req, res) => {
    const { status } = req.body;
    const appId = req.params.id;

    if (!['pending', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    db.run('UPDATE applications SET status = ? WHERE id = ?', [status, appId], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Status updated successfully' });
    });
});

module.exports = router;
