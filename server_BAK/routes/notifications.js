const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');

// Get all notifications for user
router.get('/', verifyToken, (req, res) => {
    db.all(`
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 50
    `, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Mark notification as read
router.put('/:id/read', verifyToken, (req, res) => {
    db.run(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Notification marked as read' });
        }
    );
});

// Mark all as read
router.put('/read-all', verifyToken, (req, res) => {
    db.run(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
        [req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'All notifications marked as read' });
        }
    );
});

module.exports = router;
