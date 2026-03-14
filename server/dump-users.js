const db = require('./database');

console.log('--- Registered User Data Export ---');
console.log('Note: Passwords are CRYPTOGRAPHICALLY HASHED for security and cannot be viewed in plain text.');

db.all('SELECT id, name, email, role, password_hash FROM users', [], (err, rows) => {
    if (err) {
        console.error('Database Error:', err.message);
        return;
    }
    
    console.table(rows.map(user => ({
        ID: user.id,
        Name: user.name,
        Email: user.email,
        Role: user.role,
        Password_Hash: user.password_hash.substring(0, 15) + '...'
    })));
    
    console.log('\nTo reset a specific user password, use the "Forgot Password" tool or an SQL UPDATE command.');
});
