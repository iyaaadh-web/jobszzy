const nodemailer = require('nodemailer');

const email = process.argv[2];
const pass = process.argv[3];

if (!email || !pass) {
    console.log('Usage: node smtp-debug.js <email> <password>');
    process.exit(1);
}

async function runTest() {
    console.log(`--- SMTP Deep Diagnostic ---`);
    console.log(`User: ${email}`);
    
    // Test Port 465
    try {
        console.log('\n--- Testing Port 465 (SSL) ---');
        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: 465,
            secure: true,
            auth: { user: email, pass: pass },
            tls: { rejectUnauthorized: false }
        });
        await transporter.sendMail({
            from: email,
            to: email, // send to self
            subject: 'SMTP Diagnostic: Port 465',
            text: 'Success!'
        });
        console.log('✅ Port 465 SUCCESS');
    } catch (err) {
        console.log(`❌ Port 465 FAILED: ${err.message}`);
    }

    // Test Port 587
    try {
        console.log('\n--- Testing Port 587 (TLS) ---');
        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: 587,
            secure: false,
            auth: { user: email, pass: pass },
            tls: { rejectUnauthorized: false }
        });
        await transporter.sendMail({
            from: email,
            to: email, // send to self
            subject: 'SMTP Diagnostic: Port 587',
            text: 'Success!'
        });
        console.log('✅ Port 587 SUCCESS');
    } catch (err) {
        console.log(`❌ Port 587 FAILED: ${err.message}`);
    }
}

runTest();
