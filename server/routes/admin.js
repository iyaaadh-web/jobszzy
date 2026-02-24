const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Apply admin protection to all routes in this file
router.use(verifyToken, isAdmin);

// Get all users
router.get('/users', (req, res) => {
    db.all(`SELECT id, name, email, role FROM users`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Delete a user
router.delete('/users/:id', (req, res) => {
    const userId = req.params.id;

    if (parseInt(userId) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    // Jobs are cascadingly deleted by SQLite due to ON DELETE CASCADE
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
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

module.exports = router;
