const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken } = require('../middleware/auth');

// POST a new review (Anonymous)
router.post('/', verifyToken, (req, res) => {
    const { employer_id, management, food, accommodation, fairness, opportunities, comment } = req.body;
    const seeker_id = req.user.id;

    if (!employer_id || !management || !food || !accommodation || !fairness || !opportunities) {
        return res.status(400).json({ error: 'Missing ratings or employer ID' });
    }

    db.run(
        `INSERT INTO reviews (employer_id, seeker_id, management_rating, food_rating, accommodation_rating, fairness_rating, opportunities_rating, comment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [employer_id, seeker_id, management, food, accommodation, fairness, opportunities, comment],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ message: 'Review submitted and pending moderation', id: this.lastID });
        }
    );
});

// GET reviews for an employer
router.get('/:employer_id', (req, res) => {
    db.all(
        `SELECT management_rating, food_rating, accommodation_rating, fairness_rating, opportunities_rating, comment, created_at 
         FROM reviews WHERE employer_id = ? AND status = 'approved' ORDER BY created_at DESC`,
        [req.params.employer_id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(rows);
        }
    );
});

module.exports = router;
