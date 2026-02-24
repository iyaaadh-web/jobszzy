const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'jobszzy.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            // Create Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'seeker', -- 'admin', 'employer', 'seeker'
        logo_url TEXT,
        cv_url TEXT
      )`);

            // Create Jobs table
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
      )`);

            // Create Applications table
            db.run(`CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        seeker_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'shortlisted', 'rejected'
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        cover_letter TEXT,
        cv_url TEXT, -- Seeker's CV at the time of application
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

            // Seed Admin (Requested: sales@fasmala.com / Idhu@0412.)
            db.get(`SELECT * FROM users WHERE role = 'admin'`, [], async (err, row) => {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash('Idhu@0412.', salt);
                if (!row) {
                    db.run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
                        ['System Admin', 'sales@fasmala.com', hash, 'admin']
                    );
                    console.log('Admin user seeded (sales@fasmala.com / Idhu@0412.)');
                } else if (row.email !== 'sales@fasmala.com') {
                    db.run(`UPDATE users SET email = ?, password_hash = ? WHERE id = ?`,
                        ['sales@fasmala.com', hash, row.id]
                    );
                    console.log('Admin user updated to sales@fasmala.com');
                }
            });

            // Seed an Employer user if none exists
            db.get(`SELECT * FROM users WHERE email = ?`, ['employer@jobszzy.com'], async (err, row) => {
                if (!row) {
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash('employer123', salt);
                    db.run(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
                        ['TechVision Inc.', 'employer@jobszzy.com', hash, 'employer']
                    );
                    console.log('Employer user seeded (employer@jobszzy.com / employer123)');
                }
            });
        });
    }
});

module.exports = db;
