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
});

db.serialize(() => {
    // 1. Create Tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'seeker', 
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
                        if (err) console.error('Error adding logo_url:', err.message);
                        else console.log('Migrated: Added logo_url to users table.');
                    });
                }
                if (!columnNames.includes('cv_url')) {
                    db.run("ALTER TABLE users ADD COLUMN cv_url TEXT", (err) => {
                        if (err) console.error('Error adding cv_url:', err.message);
                        else console.log('Migrated: Added cv_url to users table.');
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
        FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
    )`, (err) => { if (err) console.error('Error creating jobs table:', err.message); });

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
                        { id: 'premium', name: 'Premium', price: '99', features: ['5 Job Postings', '60 Days Visibility', 'Priority Support', 'Featured Badge'] },
                        { id: 'enterprise', name: 'Enterprise', price: '299', features: ['Unlimited Postings', '90 Days Visibility', '24/7 Support', 'Featured Badge', 'Talent Search Access'] }
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
                // Update password if needed or just confirm existence
                db.run(`UPDATE users SET password_hash = ?, role = 'admin' WHERE email = ?`, [hash, 'sales@fasmala.com']);
                console.log('Admin user verified/updated.');
            }
        } catch (e) {
            console.error('Bcrypt error during seeding:', e);
        }
    });

    // Seed Demo Employer
    db.get(`SELECT * FROM users WHERE email = ?`, ['employer@jobszzy.com'], async (err, row) => {
        if (!row && !err) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('employer123', salt);
            db.run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
                ['TechVision Inc.', 'employer@jobszzy.com', hash, 'employer']
            );
            console.log('Employer user seeded.');
        }
    });
});

module.exports = db;
