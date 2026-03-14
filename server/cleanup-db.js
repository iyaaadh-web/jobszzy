const db = require('./database');

console.log('--- Cleaning Up Dummy Users ---');

const usersToDelete = [
    'shahu@example.com',
    'rizna@example.com',
    'ibrahim@example.com',
    'saara@example.com',
    'employer@jobszzy.com',
    'admin@jobszzy.com'
];

db.serialize(() => {
    usersToDelete.forEach(email => {
        db.run('DELETE FROM users WHERE email = ?', [email], function(err) {
            if (err) {
                console.error(`Error deleting ${email}:`, err.message);
            } else if (this.changes > 0) {
                console.log(`Successfully deleted ${email}`);
            }
        });
    });
});

console.log('Cleanup script finished. Run node cleanup-db.js on the VPS.');
