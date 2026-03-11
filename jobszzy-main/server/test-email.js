const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function tryConfig(config, label) {
    console.log(`\n--- Testing ${label} ---`);
    console.log(`Host: ${config.host}, Port: ${config.port}, Secure: ${config.secure}`);

    const transporter = nodemailer.createTransport({
        ...config,
        tls: { rejectUnauthorized: false }
    });

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER,
            subject: `SMTP Test: ${label}`,
            text: `This is a test email for ${label}`
        });
        console.log(`✅ SUCCESS: ${label} worked!`);
        return true;
    } catch (error) {
        console.log(`❌ FAILED: ${label}`);
        console.log(`Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('Starting SMTP diagnostic tests...');

    const configs = [
        {
            label: 'Port 465 (SSL)',
            host: process.env.SMTP_HOST,
            port: 465,
            secure: true,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        },
        {
            label: 'Port 587 (TLS)',
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        }
    ];

    for (const config of configs) {
        if (await tryConfig(config, config.label)) {
            console.log('\nFinal recommendation: Use the settings that marked ✅ SUCCESS');
            process.exit(0);
        }
    }

    console.log('\nAll tests failed. Please double-check your password in the .env file.');
    process.exit(1);
}

runTests();
