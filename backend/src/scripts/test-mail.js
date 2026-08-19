"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function testGmail() {
    const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
    const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();
    console.log(`Testing SMTP with User: "${user}", Pass length: ${pass.length}`);
    // Test 1: service: 'gmail'
    console.log('\n--- Testing with service: gmail ---');
    try {
        const transporter1 = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: { user, pass }
        });
        const verify1 = await transporter1.verify();
        console.log('✅ Service gmail verify SUCCESS:', verify1);
    }
    catch (err) {
        console.error('❌ Service gmail verify FAILED:', err.message);
    }
    // Test 2: host: smtp.gmail.com, port 587, secure: false
    console.log('\n--- Testing with smtp.gmail.com:587 (STARTTLS) ---');
    try {
        const transporter2 = nodemailer_1.default.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user, pass }
        });
        const verify2 = await transporter2.verify();
        console.log('✅ Port 587 verify SUCCESS:', verify2);
    }
    catch (err) {
        console.error('❌ Port 587 verify FAILED:', err.message);
    }
    // Test 3: host: smtp.gmail.com, port 465, secure: true
    console.log('\n--- Testing with smtp.gmail.com:465 (SSL) ---');
    try {
        const transporter3 = nodemailer_1.default.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass }
        });
        const verify3 = await transporter3.verify();
        console.log('✅ Port 465 verify SUCCESS:', verify3);
    }
    catch (err) {
        console.error('❌ Port 465 verify FAILED:', err.message);
    }
}
testGmail().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
//# sourceMappingURL=test-mail.js.map