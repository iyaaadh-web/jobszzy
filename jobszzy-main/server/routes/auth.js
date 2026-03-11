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
        cb(null, path.join(__dirname, '../uploads'));
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

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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

        if (user.requires_password_reset === 1) {
            return res.json({ token, user: userWithoutPassword, requires_password_reset: true });
        }

        res.json({ token, user: userWithoutPassword });
    });
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    db.get('SELECT id, name FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        const tempPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(tempPassword, salt);

        db.run('UPDATE users SET password_hash = ?, requires_password_reset = 1 WHERE id = ?', [hash, user.id], async (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            const nodemailer = require('nodemailer');

            // For production, use these environment variables
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.ethereal.email",
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                tls: {
                    // Do not fail on invalid certs (common for some hosting providers)
                    rejectUnauthorized: false
                }
            });

            console.log(`[SMTP DEBUG] Attempting to send email via ${process.env.SMTP_HOST} port ${process.env.SMTP_PORT}`);

            try {
                let info = await transporter.sendMail({
                    from: process.env.SMTP_FROM || '"Jobszzy Support" <support@jobszzy.com>',
                    to: email,
                    subject: "Your Jobszzy Temporary Password",
                    text: `Hello ${user.name},\n\nYour temporary password is: ${tempPassword}\n\nPlease login with this password. You will be prompted to set a new password upon login.\n\nBest regards,\nThe Jobszzy Team`,
                });

                console.log('Recovery email sent successfully to: %s', email);
                if (process.env.NODE_ENV !== 'production') {
                    console.log('Preview URL (Ethereal): %s', nodemailer.getTestMessageUrl(info));
                    res.json({ message: 'Temporary password sent to email', preview_url: nodemailer.getTestMessageUrl(info) });
                } else {
                    res.json({ message: 'Temporary password sent to your email' });
                }
            } catch (smtpErr) {
                console.error('[SMTP ERROR] Failed to send email:', smtpErr);
                res.status(500).json({
                    error: 'Failed to send email. If you are the admin, please check the server logs.',
                    details: smtpErr.message
                });
            }
        });
    });
});

// RESET TEMPORARY PASSWORD
router.post('/reset-password', require('../middleware/auth').verifyToken, async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: 'New password is required' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    db.run(`UPDATE users SET password_hash = ?, requires_password_reset = 0 WHERE id = ?`, [hash, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Password reset successfully' });
    });
});

// Get current user details from token
router.get('/me', require('../middleware/auth').verifyToken, (req, res) => {
    db.get(`SELECT id, name, email, role, logo_url, cv_url, bio, skills, plan_id, subscription_status, available_immediately FROM users WHERE id = ?`, [req.user.id], (err, user) => {
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

// Update Logo for employer
router.put('/logo', require('../middleware/auth').verifyToken, upload.single('logo'), (req, res) => {
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only employers and admins can update logos' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No logo file provided' });
    }

    const logo_url = `/uploads/${req.file.filename}`;

    db.run(`UPDATE users SET logo_url = ? WHERE id = ?`, [logo_url, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Logo updated successfully', logo_url });
    });
});

// Get all companies
router.get('/companies', (req, res) => {
    db.all(`SELECT id, name, logo_url, bio FROM users WHERE role = 'employer'`, [], (err, companies) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(companies);
    });
});

// Get all talent (Job Seekers) - Protected for Employers/Admins
router.get('/talent', require('../middleware/auth').verifyToken, require('../middleware/auth').isEmployerOrAdmin, (req, res) => {
    db.all(`SELECT id, name, email, cv_url, bio, skills, available_immediately FROM users WHERE role = 'seeker'`, [], (err, talent) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(talent);
    });
});

// Update Profile
router.put('/profile', require('../middleware/auth').verifyToken, (req, res) => {
    const { name, bio, skills, available_immediately } = req.body;
    const userId = req.user.id;

    // Handle available_immediately: convert to 0/1 for SQLite
    const availImm = available_immediately !== undefined ? (available_immediately ? 1 : 0) : null;

    db.run(
        `UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio), skills = COALESCE(?, skills), available_immediately = COALESCE(?, available_immediately) WHERE id = ?`,
        [name || null, bio || null, skills || null, availImm, userId],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// Subscribe to a plan
router.post('/subscribe', require('../middleware/auth').verifyToken, (req, res) => {
    const { plan_id } = req.body;
    const userId = req.user.id;

    if (!plan_id) {
        return res.status(400).json({ error: 'No plan ID provided' });
    }

    console.log(`[DEBUG] User ${userId} subscribing. Plan sent: "${plan_id}"`);

    db.get("SELECT value FROM settings WHERE key = 'pricing_plans'", [], (err, row) => {
        if (err) {
            console.error('[DATABASE ERROR] Fetching plans:', err);
            return res.status(500).json({ error: `Database error: ${err.message}` });
        }

        try {
            const plans = (row && row.value) ? JSON.parse(row.value) : [];
            console.log(`[DEBUG] Available plans in DB:`, JSON.stringify(plans));

            const selectedPlan = plans.find(p => String(p.id) === String(plan_id));

            if (!selectedPlan) {
                console.warn(`[VALIDATION ERROR] Plan "${plan_id}" not found. Available:`, plans.map(p => p.id));
                return res.status(400).json({
                    error: 'Invalid plan selected',
                    details: `Sent: ${plan_id}, Available: ${plans.map(p => p.id).join(', ')}`
                });
            }

            const priceStr = String(selectedPlan.price || '0').toLowerCase();
            const status = (priceStr === '0' || priceStr === 'free') ? 'active' : 'pending';

            db.run(
                `UPDATE users SET plan_id = ?, subscription_status = ? WHERE id = ?`,
                [plan_id, status, userId],
                function (err) {
                    if (err) {
                        console.error('[DATABASE ERROR] Updating subscription:', err);
                        return res.status(500).json({ error: `Database error during update: ${err.message}` });
                    }
                    console.log(`[SUCCESS] User ${userId} -> ${plan_id} (${status})`);
                    res.json({ message: `Plan ${selectedPlan.name} selected successfully`, plan_id, status });
                }
            );
        } catch (parseErr) {
            console.error('[JSON ERROR] Parsing plans:', parseErr);
            return res.status(500).json({ error: `Internal server error: ${parseErr.message}` });
        }
    });
});

// Confirm Payment (Upload Slip)
router.post('/confirm-payment', require('../middleware/auth').verifyToken, upload.single('slip'), (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).json({ error: 'No payment slip file provided' });
    }

    const payment_slip_url = `/uploads/${req.file.filename}`;

    db.run(
        `UPDATE users SET payment_slip_url = ?, subscription_status = 'pending' WHERE id = ?`,
        [payment_slip_url, userId],
        function (err) {
            if (err) return res.status(500).json({ error: 'Database error' });

            // Notify admin
            db.get('SELECT id FROM users WHERE role = "admin" LIMIT 1', (err, admin) => {
                if (!err && admin) {
                    const message = `New payment slip uploaded by ${req.user.email} for plan approval.`;
                    db.run(
                        'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
                        [admin.id, message, 'payment']
                    );
                }
            });

            res.json({
                message: 'Payment slip submitted successfully. An admin will review it shortly.',
                payment_slip_url
            });
        }
    );
});

// DELETE Account and Data
router.delete('/me', require('../middleware/auth').verifyToken, (req, res) => {
    // Delete the user and let SQLite ON DELETE CASCADE handle the rest (if configured properly).
    // The tokens are stateless JWTs, so they will expire on their own. We just remove the user.
    db.run(`DELETE FROM users WHERE id = ?`, [req.user.id], function (err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Account and all associated data deleted successfully' });
    });
});

module.exports = router;
