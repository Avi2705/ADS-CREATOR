"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.refresh = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../users/user.model"));
const tenant_model_1 = __importDefault(require("../tenants/tenant.model"));
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-change-in-production';
// In-memory array to store valid refresh tokens (for demo; production should store in DB)
let refreshTokens = [];
const register = async (req, res) => {
    try {
        const { name, email, password, accountType, businessType, companyName } = req.body;
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        let tenantId = undefined;
        let role = 'EXPLORER';
        if (accountType === 'BUSINESS') {
            if (!companyName || !businessType) {
                res.status(400).json({ message: 'Company name and business type are required for business accounts' });
                return;
            }
            const tenant = await tenant_model_1.default.create({
                name: companyName,
                type: businessType
            });
            tenantId = tenant._id;
            role = 'BUSINESS_OWNER';
        }
        const user = await user_model_1.default.create({
            name,
            email,
            passwordHash,
            customerType: 'EXPLORER',
            accountType: 'EXPLORER',
            role: 'CUSTOMER',
            tenantId
        });
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role, tenantId: user.tenantId, customerType: user.customerType, accountType: user.accountType }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        refreshTokens.push(refreshToken);
        res.status(201).json({
            token: accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                customerType: user.customerType || 'EXPLORER',
                accountType: user.accountType,
                tenantId: user.tenantId,
                status: user.status,
                freeAdsAllowed: user.freeAdsAllowed ?? 1,
                freeAdsUsed: user.freeAdsUsed ?? 0
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        // Case-insensitive lookup with support for admin alias
        const searchConditions = [
            { email: normalizedEmail },
            { email: new RegExp(`^${normalizedEmail}$`, 'i') }
        ];
        if (normalizedEmail === 'admin@adscreator.com') {
            searchConditions.push({ email: 'admin@adhunter.com' });
        }
        else if (normalizedEmail === 'admin@adhunter.com') {
            searchConditions.push({ email: 'admin@adscreator.com' });
        }
        const user = await user_model_1.default.findOne({ $or: searchConditions });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role, tenantId: user.tenantId, customerType: user.customerType, accountType: user.accountType }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        refreshTokens.push(refreshToken);
        res.json({
            token: accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                customerType: user.customerType || (user.role === 'SUPER_ADMIN' ? null : 'EXPLORER'),
                accountType: user.accountType,
                tenantId: user.tenantId,
                status: user.status,
                freeAdsAllowed: user.freeAdsAllowed ?? 1,
                freeAdsUsed: user.freeAdsUsed ?? 0
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        res.status(401).json({ message: 'Refresh Token required' });
        return;
    }
    if (!refreshTokens.includes(refreshToken)) {
        res.status(403).json({ message: 'Invalid Refresh Token' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await user_model_1.default.findById(decoded.userId);
        if (!user) {
            res.status(403).json({ message: 'User no longer exists' });
            return;
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role, tenantId: user.tenantId, accountType: user.accountType }, JWT_SECRET, { expiresIn: '15m' });
        res.json({ token: newAccessToken });
    }
    catch (error) {
        res.status(403).json({ message: 'Expired or invalid Refresh Token' });
    }
};
exports.refresh = refresh;
const otpStore = new Map();
const mail_service_1 = require("../../services/mail.service");
/**
 * POST /api/auth/forgot-password
 * Initiates password reset by generating a 6-digit OTP and sending it via Nodemailer
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
            return;
        }
        const cleanEmail = email.trim().toLowerCase();
        // Generate secure 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
        let userName = 'Valued User';
        // 1. Try finding in MongoDB
        try {
            const user = await user_model_1.default.findOne({ email: cleanEmail });
            if (user) {
                user.resetPasswordOtp = otp;
                user.resetPasswordExpires = new Date(expires);
                await user.save();
                userName = user.name || userName;
            }
        }
        catch (dbErr) {
            console.warn('[AUTH] MongoDB lookup failed, relying on memory store for OTP:', dbErr);
        }
        // 2. Store in memory map for fast validation & mock users support
        otpStore.set(cleanEmail, {
            otp,
            expires,
            userName
        });
        // 3. Send email via Nodemailer
        const emailResult = await (0, mail_service_1.sendPasswordResetOtpEmail)(cleanEmail, otp, userName);
        if (!emailResult.success) {
            res.status(500).json({
                success: false,
                message: 'Could not send verification email. Please check your email configuration and try again.'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox or spam folder.`
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Failed to process forgot password request. Please try again.' });
    }
};
exports.forgotPassword = forgotPassword;
/**
 * POST /api/auth/verify-otp
 * Validates the 6-digit code for the specified email
 */
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
            return;
        }
        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = otp.toString().trim();
        // Check memory store
        const memRecord = otpStore.get(cleanEmail);
        let isValid = false;
        if (memRecord && memRecord.otp === cleanOtp && Date.now() <= memRecord.expires) {
            isValid = true;
        }
        // If not in memory store or expired, check MongoDB
        if (!isValid) {
            try {
                const user = await user_model_1.default.findOne({ email: cleanEmail });
                if (user &&
                    user.resetPasswordOtp === cleanOtp &&
                    user.resetPasswordExpires &&
                    user.resetPasswordExpires.getTime() > Date.now()) {
                    isValid = true;
                }
            }
            catch (dbErr) {
                console.warn('[AUTH] DB OTP check failed:', dbErr);
            }
        }
        if (!isValid) {
            res.status(400).json({ success: false, message: 'Invalid or expired verification code. Please request a new one.' });
            return;
        }
        // Generate temporary reset token
        const resetToken = jsonwebtoken_1.default.sign({ email: cleanEmail, purpose: 'PASSWORD_RESET' }, JWT_SECRET, { expiresIn: '15m' });
        res.status(200).json({
            success: true,
            message: 'Code verified successfully! You may now set a new password.',
            resetToken
        });
    }
    catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
    }
};
exports.verifyOtp = verifyOtp;
/**
 * POST /api/auth/reset-password
 * Resets user password after verifying the 6-digit OTP
 */
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            res.status(400).json({ success: false, message: 'Email, verification code, and new password are required.' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
            return;
        }
        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = otp.toString().trim();
        // Validate OTP
        const memRecord = otpStore.get(cleanEmail);
        let isValid = false;
        let userName = 'Valued User';
        if (memRecord && memRecord.otp === cleanOtp && Date.now() <= memRecord.expires) {
            isValid = true;
            userName = memRecord.userName || userName;
        }
        let userInDb = null;
        try {
            userInDb = await user_model_1.default.findOne({ email: cleanEmail });
            if (userInDb &&
                userInDb.resetPasswordOtp === cleanOtp &&
                userInDb.resetPasswordExpires &&
                userInDb.resetPasswordExpires.getTime() > Date.now()) {
                isValid = true;
                userName = userInDb.name || userName;
            }
        }
        catch (dbErr) {
            console.warn('[AUTH] DB lookup during reset:', dbErr);
        }
        if (!isValid) {
            res.status(400).json({ success: false, message: 'Invalid or expired verification code. Please request a new code.' });
            return;
        }
        // Hash new password
        const passwordHash = await bcrypt_1.default.hash(newPassword, 10);
        // Update in MongoDB
        if (userInDb) {
            userInDb.passwordHash = passwordHash;
            userInDb.resetPasswordOtp = null;
            userInDb.resetPasswordExpires = null;
            await userInDb.save();
        }
        // Clear from memory store
        otpStore.delete(cleanEmail);
        // Send confirmation email
        (0, mail_service_1.sendPasswordResetSuccessEmail)(cleanEmail, userName).catch(err => console.error('[MAILER] Success alert error:', err));
        res.status(200).json({
            success: true,
            message: 'Your password has been successfully reset! You can now sign in with your new password.'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error during password reset.' });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map