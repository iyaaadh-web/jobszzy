const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const PORT = 5000;
const HOST = 'localhost';
const dbPath = path.resolve(__dirname, 'jobszzy.sqlite');
const testEmail = 'sales@fasmala.com';

function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const response = {
                    status: res.statusCode,
                    data: body ? JSON.parse(body) : {}
                };
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(response);
                } else {
                    reject(new Error(`API Error ${res.statusCode}: ${JSON.stringify(response.data)}`));
                }
            });
        });

        req.on('error', (err) => reject(new Error(`Network Error: ${err.message}`)));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTest() {
    console.log('--- Starting Forgot Password Test (Built-in HTTP) ---');

    try {
        // 1. Request forgot password
        console.log(`1. Requesting forgot password for ${testEmail}...`);
        const forgotRes = await request('POST', '/api/auth/forgot-password', { email: testEmail });
        console.log('Forgot Password Response:', forgotRes.data.message);

        // 2. Directly get the token from DB
        console.log('2. Fetching token from database...');
        const db = new sqlite3.Database(dbPath);
        const tokenRow = await new Promise((resolve, reject) => {
            db.get('SELECT token FROM password_resets WHERE email = ? ORDER BY id DESC LIMIT 1', [testEmail], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!tokenRow) {
            throw new Error('Token not found in database');
        }
        const token = tokenRow.token;
        console.log('Found token:', token);
        db.close();

        // 3. Verify the token
        console.log('3. Verifying token via API...');
        const verifyRes = await request('GET', `/api/auth/verify-reset-token?email=${testEmail}&token=${token}`);
        console.log('Verify Token Response:', verifyRes.data.message);

        // 4. Reset the password
        console.log('4. Resetting password...');
        const newPassword = 'NewPassword123!';
        const resetRes = await request('POST', '/api/auth/reset-password', {
            email: testEmail,
            token: token,
            newPassword: newPassword
        });
        console.log('Reset Password Response:', resetRes.data.message);

        // 5. Try to login with new password
        console.log('5. Attempting login with new password...');
        const loginRes = await request('POST', '/api/auth/login', {
            email: testEmail,
            password: newPassword
        });
        console.log('Login Success! User:', loginRes.data.user.email);

        console.log('\n--- ALL TESTS PASSED SUCCESSFULLY ---');
    } catch (error) {
        console.error('\n--- TEST FAILED ---');
        console.error(error.message);
        process.exit(1);
    }
}

runTest();
