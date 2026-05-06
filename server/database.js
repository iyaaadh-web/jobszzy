const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'jobszzy.sqlite');
console.log('--- Initializing Database ---');
console.log('Path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('CRITICAL: Error opening database:', err.message);
        process.exit(1); // Exit if DB cannot be opened
    }
    console.log('Connected to SQLite database successfully.');
    // Enable Foreign Key support for cascading deletions
    db.run("PRAGMA foreign_keys = ON;");
});

db.serialize(() => {
    // 1. Create Tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        password_plaintext TEXT,
        role TEXT DEFAULT 'seeker', 
        status TEXT DEFAULT 'active',
        logo_url TEXT,
        cv_url TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            // MIGRATION: Check if logo_url and cv_url exist (SQLite doesn't add them automatically if table exists)
            db.all("PRAGMA table_info(users)", (err, columns) => {
                if (err) return console.error('Error checking table_info:', err.message);

                const columnNames = columns.map(c => c.name);
                if (!columnNames.includes('logo_url')) {
                    db.run("ALTER TABLE users ADD COLUMN logo_url TEXT", (err) => {
                        if (err) console.error('[MIGRATION ERROR] logo_url:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added logo_url');
                    });
                }
                if (!columnNames.includes('cv_url')) {
                    db.run("ALTER TABLE users ADD COLUMN cv_url TEXT", (err) => {
                        if (err) console.error('[MIGRATION ERROR] cv_url:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added cv_url');
                    });
                }
                if (!columnNames.includes('bio')) {
                    db.run("ALTER TABLE users ADD COLUMN bio TEXT", (err) => {
                        if (err) console.error('[MIGRATION ERROR] bio:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added bio');
                    });
                }
                if (!columnNames.includes('skills')) {
                    db.run("ALTER TABLE users ADD COLUMN skills TEXT", (err) => {
                        if (err) console.error('[MIGRATION ERROR] skills:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added skills');
                    });
                }
                if (!columnNames.includes('plan_id')) {
                    db.run("ALTER TABLE users ADD COLUMN plan_id TEXT DEFAULT 'basic'", (err) => {
                        if (err) console.error('[MIGRATION ERROR] plan_id:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added plan_id');
                    });
                }
                if (!columnNames.includes('subscription_status')) {
                    db.run("ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'none'", (err) => {
                        if (err) console.error('[MIGRATION ERROR] subscription_status:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added subscription_status');
                    });
                }
                if (!columnNames.includes('payment_slip_url')) {
                    db.run("ALTER TABLE users ADD COLUMN payment_slip_url TEXT", (err) => {
                        if (err) console.error('[MIGRATION ERROR] payment_slip_url:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added payment_slip_url');
                    });
                }
                if (!columnNames.includes('available_immediately')) {
                    db.run("ALTER TABLE users ADD COLUMN available_immediately INTEGER DEFAULT 0", (err) => {
                        if (err) console.error('[MIGRATION ERROR] available_immediately:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added available_immediately');
                    });
                }
                if (!columnNames.includes('requires_password_reset')) {
                    db.run("ALTER TABLE users ADD COLUMN requires_password_reset INTEGER DEFAULT 0", (err) => {
                        if (err) console.error('[MIGRATION ERROR] requires_password_reset:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added requires_password_reset');
                    });
                }
                if (!columnNames.includes('password_plaintext')) {
                    db.run("ALTER TABLE users ADD COLUMN password_plaintext TEXT", (err) => {
                        if (err) console.error('[MIGRATION ERROR] password_plaintext:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added password_plaintext');
                    });
                }
                if (!columnNames.includes('status')) {
                    db.run("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'", (err) => {
                        if (err) console.error('[MIGRATION ERROR] status:', err.message);
                        else console.log('[MIGRATION SUCCESS] Added status for users');
                    });
                }
            });
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL,
        salary TEXT,
        description TEXT,
        employer_id INTEGER,
        pdf_url TEXT,
        posted_time TEXT,
        color TEXT DEFAULT '#3b82f6',
        category TEXT DEFAULT 'general',
        is_urgent INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error('Error creating jobs table:', err.message);
        else {
            db.all("PRAGMA table_info(jobs)", (err, columns) => {
                const columnNames = columns.map(c => c.name);
                if (!columnNames.includes('category')) {
                    db.run("ALTER TABLE jobs ADD COLUMN category TEXT DEFAULT 'general'");
                }
                if (!columnNames.includes('is_urgent')) {
                    db.run("ALTER TABLE jobs ADD COLUMN is_urgent INTEGER DEFAULT 0");
                }
                if (!columnNames.includes('status')) {
                    db.run("ALTER TABLE jobs ADD COLUMN status TEXT DEFAULT 'active'");
                }
                if (!columnNames.includes('deadline')) {
                    db.run("ALTER TABLE jobs ADD COLUMN deadline TEXT");
                }
                if (!columnNames.includes('poster_url')) {
                    db.run("ALTER TABLE jobs ADD COLUMN poster_url TEXT");
                }
            });
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employer_id INTEGER NOT NULL,
        seeker_id INTEGER NOT NULL,
        management_rating INTEGER,
        food_rating INTEGER,
        accommodation_rating INTEGER,
        fairness_rating INTEGER,
        opportunities_rating INTEGER,
        comment TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        seeker_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        cover_letter TEXT,
        cv_url TEXT,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => { if (err) console.error('Error creating applications table:', err.message); });

    db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )`, (err) => {
        if (err) console.error('Error creating settings table:', err.message);
        else {
            // Seed default pricing
            db.get("SELECT * FROM settings WHERE key = 'pricing_plans'", (err, row) => {
                if (!row) {
                    const defaultPlans = [
                        { id: 'basic', name: 'Basic', price: '0', features: ['1 Job Posting', '30 Days Visibility', 'Standard Support'] },
                        { id: 'premium', name: 'Premium', price: '750', features: ['5 Job Postings', '60 Days Visibility', 'Priority Support', 'Featured Badge'] },
                        { id: 'enterprise', name: 'Enterprise', price: '2500', features: ['Unlimited Postings', '90 Days Visibility', '24/7 Support', 'Featured Badge', 'Talent Search Access'] }
                    ];
                    db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ['pricing_plans', JSON.stringify(defaultPlans)]);
                }
            });
        }
    });

    // 2. Seeding Logic (Robust check)
    // Seed Admin: sales@fasmala.com / Idhu@0412.
    db.get(`SELECT * FROM users WHERE email = ?`, ['sales@fasmala.com'], async (err, row) => {
        if (err) return console.error('Error checking for admin:', err.message);

        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('Idhu@0412.', salt);

            if (!row) {
                db.run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
                    ['System Admin', 'sales@fasmala.com', hash, 'admin'],
                    (err) => { if (err) console.error('Error seeding admin:', err.message); else console.log('Admin user seeded.'); }
                );
            } else {
                // Confirm role is admin
                if (row.role !== 'admin') {
                    db.run(`UPDATE users SET role = 'admin' WHERE email = ?`, ['sales@fasmala.com']);
                }
                console.log('Admin user verified.');
            }
        } catch (e) {
            console.error('Bcrypt error during seeding:', e);
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => { if (err) console.error('Error creating notifications table:', err.message); });

    db.run(`CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL
    )`, (err) => { if (err) console.error('Error creating password_resets table:', err.message); });
});

module.exports = db;
