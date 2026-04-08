const express = require('express');
const router = express.Router();
const crypto = require('crypto');
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
            `INSERT INTO users (name, email, password_hash, password_plaintext, role, logo_url) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, password_hash, password, validRole, logo_url],
            function (err) {
                if (err) {
                    console.error('Registration Database Error:', err.message);
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Database error: ' + err.message });
                }

                // Generate token upon successful registration
                const token = jwt.sign({ id: this.lastID, email, role: validRole }, JWT_SECRET, { expiresIn: '365d' });
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
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '365d' });

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
        if (err || !user) {
            // To prevent email enumeration, we can return success anyway
            // but for this app, we'll return 404 for clarity as it currently does
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a 6-digit numeric code instead of a long token
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60000).toISOString(); // 15 mins expiry

        // Clear any existing tokens for this email first
        db.run('DELETE FROM password_resets WHERE email = ?', [email], (delErr) => {
            if (delErr) console.error('Error deleting old tokens:', delErr);

            db.run('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)', [email, token, expiresAt], async (insErr) => {
                if (insErr) {
                    console.error('Error storing reset token:', insErr);
                    return res.status(500).json({ error: 'Database error' });
                }

                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || "smtp.hostinger.com",
                    port: parseInt(process.env.SMTP_PORT) || 465,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                    tls: {
                        rejectUnauthorized: false
                    },
                    debug: true,
                    logger: true
                });

                const resetUrl = `${process.env.FRONTEND_URL || 'https://jobszzy.com'}/reset-password?token=${token}&email=${email}`;
                console.log(`[SMTP] Attempting reset email to ${email}. Link: ${resetUrl}`);

                try {
                    await transporter.sendMail({
                        from: process.env.SMTP_FROM || `"Jobszzy" <support@jobszzy.com>`,
                        to: email,
                        subject: "Security Code for Jobszzy Password Reset",
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #3b82f6; text-align: center;">Password Reset Request</h2>
                                <p>Hello ${user.name},</p>
                                <p>You requested to reset your password. Please use the following 6-digit security code:</p>
                                <div style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; letter-spacing: 5px; color: #1f2937; margin: 20px 0;">
                                    ${token}
                                </div>
                                <p>Enter this code on the reset page. This code is valid for <b>15 minutes</b>.</p>
                                <p>If you didn't request this, please ignore this email.</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="font-size: 12px; color: #6b7280; text-align: center;">The Jobszzy Team</p>
                            </div>
                        `,
                    });

                    console.log(`[SMTP] Success: Reset email sent to ${email}`);
                    res.json({ message: 'Password reset link sent to your email' });
                } catch (smtpErr) {
                    console.error('[SMTP ERROR] Details:', smtpErr);
                    res.status(500).json({
                        error: 'Failed to send email. Please try again later.',
                        code: smtpErr.code
                    });
                }
            });
        });
    });
});

// VERIFY RESET TOKEN
router.get('/verify-reset-token', (req, res) => {
    const { email, token } = req.query;
    if (!email || !token) return res.status(400).json({ error: 'Email and token are required' });

    db.get('SELECT * FROM password_resets WHERE email = ? AND token = ?', [email, token], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(400).json({ error: 'Invalid reset link' });

        const now = new Date();
        const expiresAt = new Date(row.expires_at);

        if (now > expiresAt) {
            return res.status(400).json({ error: 'Reset link has expired' });
        }

        res.json({ message: 'Token is valid' });
    });
});

// RESET PASSWORD (PUBLIC)
router.post('/reset-password', async (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
        return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    // Verify token again before resetting
    db.get('SELECT * FROM password_resets WHERE email = ? AND token = ?', [email, token], async (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(400).json({ error: 'Invalid or expired reset link' });

        const now = new Date();
        if (now > new Date(row.expires_at)) {
            return res.status(400).json({ error: 'Reset link has expired' });
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);

            db.run('UPDATE users SET password_hash = ?, password_plaintext = ?, requires_password_reset = 0 WHERE email = ?', [hash, newPassword, email], function (err) {
                if (err) return res.status(500).json({ error: 'Database error' });

                // Delete the used token
                db.run('DELETE FROM password_resets WHERE email = ?', [email]);

                res.json({ message: 'Password reset successfully. You can now login with your new password.' });
            });
        } catch (error) {
            res.status(500).json({ error: 'Server error during password hashing' });
        }
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
