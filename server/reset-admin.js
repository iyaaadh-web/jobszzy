const db = require('./database');
const bcrypt = require('bcrypt');

async function resetAdmin() {
    console.log('--- Force Resetting Admin Password ---');
    const email = 'sales@fasmala.com';
    const pass = 'Idhu@0412.';
    
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(pass, salt);
        
        db.run('UPDATE users SET password_hash = ?, role = "admin" WHERE email = ?', [hash, email], function(err) {
            if (err) {
                console.error('Error:', err.message);
            } else if (this.changes === 0) {
                console.log('User not found. Creating new admin...');
                db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', 
                    ['System Admin', email, hash, 'admin'], (err2) => {
                        if (err2) console.error('Insert Error:', err2.message);
                        else console.log('Admin created successfully!');
                    });
            } else {
                console.log('Admin password updated successfully!');
            }
        });
    } catch (e) {
        console.error('Bcrypt error:', e);
    }
}

resetAdmin();
