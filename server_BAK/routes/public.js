const express = require('express');
const router = express.Router();
const db = require('../database');

// Public access to specific settings (e.g., pricing_plans)
router.get('/settings/:key', (req, res) => {
    const allowedKeys = ['pricing_plans'];
    if (!allowedKeys.includes(req.params.key)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    db.get("SELECT value FROM settings WHERE key = ?", [req.params.key], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(row ? JSON.parse(row.value) : null);
    });
});

module.exports = router;
