const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const path = require('path');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Setup Multer for Admin Logo Updates
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'admin-logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images allowed'), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Apply admin protection to all routes in this file
router.use(verifyToken, isAdmin);

// Get all users
router.get('/users', (req, res) => {
    db.all(`SELECT id, name, email, role, password_plaintext, status, logo_url FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Update any user (Admin only)
router.put('/users/:id', upload.single('logo'), (req, res) => {
    const userId = req.params.id;
    const { name, email, role, status } = req.body;
    let logo_url = req.file ? `/uploads/${req.file.filename}` : null;

    console.log(`[ADMIN ACTION] Updating user ${userId}`);

    // If no new logo uploaded, don't change it in the query unless explicitly handled
    let query = `UPDATE users SET name = ?, email = ?, role = ?, status = ?`;
    let params = [name, email, role, status];

    if (logo_url) {
        query += `, logo_url = ?`;
        params.push(logo_url);
    }

    query += ` WHERE id = ?`;
    params.push(userId);

    db.run(query, params, function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated successfully', logo_url });
    });
});

// Delete a user
router.delete('/users/:id', (req, res) => {
    const userId = req.params.id;

    if (parseInt(userId) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    console.log(`[ADMIN ACTION] Admin ${req.user.email} is archiving user ID: ${userId}`);
    // Marking user as 'deleted' instead of permanent removal
    db.run(`UPDATE users SET status = 'deleted' WHERE id = ?`, [userId], function (err) {
        if (err) {
            console.error(`[ADMIN ERROR] Failed to archive user ${userId}:`, err.message);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        console.log(`[ADMIN SUCCESS] User ${userId} has been marked as deleted.`);
        res.json({ message: 'User marked as deleted successfully' });
    });
});

// Get all jobs (admin view)
router.get('/jobs', (req, res) => {
    db.all(`
    SELECT j.*, u.email as employer_email 
    FROM jobs j 
    LEFT JOIN users u ON j.employer_id = u.id
    ORDER BY j.id DESC
  `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Settings Management
router.get('/settings/:key', (req, res) => {
    db.get("SELECT value FROM settings WHERE key = ?", [req.params.key], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(row ? JSON.parse(row.value) : null);
    });
});

router.post('/settings/:key', (req, res) => {
    const value = JSON.stringify(req.body);
    db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [req.params.key, value], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Settings updated successfully' });
    });
});

// Get pending subscriptions
router.get('/subscriptions/pending', (req, res) => {
    db.all(`SELECT id, name, email, plan_id, subscription_status, payment_slip_url FROM users WHERE subscription_status = 'pending'`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Approve a subscription
router.put('/subscriptions/:id/approve', (req, res) => {
    const userId = req.params.id;
    db.run(`UPDATE users SET subscription_status = 'active' WHERE id = ?`, [userId], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });

        // Notify user
        const message = "Your subscription has been approved! You now have full access to the portal.";
        db.run('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)', [userId, message, 'subscription']);

        res.json({ message: 'Subscription approved successfully' });
    });
});

// --- Review Moderation ---
// Get all pending reviews
router.get('/reviews/pending', (req, res) => {
    db.all(
        `SELECT r.*, u_emp.name as employer_name, u_seek.name as seeker_name
         FROM reviews r
         LEFT JOIN users u_emp ON r.employer_id = u_emp.id
         LEFT JOIN users u_seek ON r.seeker_id = u_seek.id
         WHERE r.status = 'pending'
         ORDER BY r.created_at DESC`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(rows);
        }
    );
});

// Approve a review
router.put('/reviews/:id/approve', (req, res) => {
    db.run(`UPDATE reviews SET status = 'approved' WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Review not found' });
        res.json({ message: 'Review approved successfully' });
    });
});

// Delete (reject) a review
router.delete('/reviews/:id', (req, res) => {
    db.run(`DELETE FROM reviews WHERE id = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'Review not found' });
        res.json({ message: 'Review deleted successfully' });
    });
});

// Get admin stats for analytics
router.get('/stats', (req, res) => {
    const stats = {};

    const queries = [
        { key: 'employers', query: "SELECT COUNT(*) as count FROM users WHERE role = 'employer'" },
        { key: 'seekers', query: "SELECT COUNT(*) as count FROM users WHERE role = 'seeker'" },
        { key: 'jobs', query: "SELECT COUNT(*) as count FROM jobs" },
        { key: 'applications', query: "SELECT COUNT(*) as count FROM applications" },
        { key: 'pending_subscriptions', query: "SELECT COUNT(*) as count FROM users WHERE subscription_status = 'pending'" }
    ];

    let completed = 0;
    queries.forEach(q => {
        db.get(q.query, [], (err, row) => {
            if (!err) stats[q.key] = row.count;
            completed++;
            if (completed === queries.length) {
                res.json(stats);
            }
        });
    });
});

module.exports = router;
