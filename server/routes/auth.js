const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

// Setup Multer for Logo/CV Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'logo' && file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else if (file.fieldname === 'cv' && file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Logos must be images, CVs must be PDFs.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Register a new user with optional logo upload
router.post('/register', upload.single('logo'), async (req, res) => {
    const { name, email, password, role } = req.body;
    const logo_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (role === 'employer' && !logo_url) {
        return res.status(400).json({ error: 'Company logo is required for employer registration' });
    }

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Enforce valid roles, default to seeker
    const validRole = ['seeker', 'employer'].includes(role) ? role : 'seeker';

    try {
        console.log(`Registering user: ${email}, role: ${validRole}`);
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        db.run(
            `INSERT INTO users (name, email, password_hash, role, logo_url) VALUES (?, ?, ?, ?, ?)`,
            [name, email, password_hash, validRole, logo_url],
            function (err) {
                if (err) {
                    console.error('Registration Database Error:', err.message);
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Database error: ' + err.message });
                }

                // Generate token upon successful registration
                const token = jwt.sign({ id: this.lastID, email, role: validRole }, JWT_SECRET, { expiresIn: '1d' });
                console.log(`User registered successfully: ${email} (ID: ${this.lastID})`);
                res.status(201).json({
                    message: 'User registered successfully',
                    token,
                    user: { id: this.lastID, name, email, role: validRole, logo_url }
                });
            }
        );
    } catch (error) {
        console.error('Registration Server Error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log(`Login attempt for: ${email}`);
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) {
            console.error('Login Database Error:', err.message);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        if (!user) {
            console.log(`Login failed: User ${email} not found`);
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            console.log(`Login failed: Incorrect password for ${email}`);
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        console.log(`Login successful for: ${email}`);
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        // Don't send the password hash back
        const { password_hash, ...userWithoutPassword } = user;

        res.json({ token, user: userWithoutPassword });
    });
});

// Get current user details from token
router.get('/me', require('../middleware/auth').verifyToken, (req, res) => {
    db.get(`SELECT id, name, email, role, logo_url, cv_url FROM users WHERE id = ?`, [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

// Upload CV for job seeker
router.put('/cv', require('../middleware/auth').verifyToken, upload.single('cv'), (req, res) => {
    if (req.user.role !== 'seeker') {
        return res.status(403).json({ error: 'Only job seekers can upload CVs' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No CV file provided' });
    }

    const cv_url = `/uploads/${req.file.filename}`;

    db.run(`UPDATE users SET cv_url = ? WHERE id = ?`, [cv_url, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'CV uploaded successfully', cv_url });
    });
});

// Get all companies
router.get('/companies', (req, res) => {
    db.all(`SELECT id, name, logo_url FROM users WHERE role = 'employer'`, [], (err, companies) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(companies);
    });
});

// Get all talent (Job Seekers) - Protected for Employers/Admins
router.get('/talent', require('../middleware/auth').verifyToken, require('../middleware/auth').isEmployerOrAdmin, (req, res) => {
    db.all(`SELECT id, name, email, cv_url FROM users WHERE role = 'seeker'`, [], (err, talent) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(talent);
    });
});

// Update Profile
router.put('/profile', require('../middleware/auth').verifyToken, (req, res) => {
    const { name, logo_url, cv_url } = req.body;
    const userId = req.user.id;

    db.run(
        `UPDATE users SET name = COALESCE(?, name), logo_url = COALESCE(?, logo_url), cv_url = COALESCE(?, cv_url) WHERE id = ?`,
        [name, logo_url, cv_url, userId],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Profile updated successfully' });
        }
    );
});

module.exports = router;
