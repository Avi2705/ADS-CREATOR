import nodemailer from 'nodemailer';

// Helper to get configured nodemailer transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = port === 465 || process.env.SMTP_SECURE === 'true';
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

  if (user && pass) {
    return nodemailer.createTransport({
      host: host.includes('gmail') ? 'smtp.gmail.com' : host,
      port: host.includes('gmail') ? 465 : port,
      secure: host.includes('gmail') ? true : secure,
      auth: {
        user,
        pass
      }
    });
  }

  // Fallback test transporter or null
  return null;
};

export const sendPasswordResetOtpEmail = async (
  toEmail: string,
  otpCode: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> => {
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const fromEmail = (smtpUser && smtpUser.includes('@gmail.com'))
    ? `AD-HUNTER <${smtpUser}>`
    : (process.env.FROM_EMAIL || 'AD-HUNTER <no-reply@adhunter.ai>');
  const name = userName || 'Valued User';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Code - AD-HUNTER</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
          .header { background: #09090b; padding: 32px 24px; text-align: center; color: #ffffff; }
          .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .brand-red { color: #dc2626; }
          .subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; font-weight: 700; margin-top: 4px; }
          .content { padding: 32px 28px; }
          .greeting { font-size: 16px; font-weight: 800; color: #09090b; margin-bottom: 12px; }
          .text { font-size: 13px; line-height: 1.6; color: #52525b; margin-bottom: 24px; }
          .otp-box { background: #fef2f2; border: 2px dashed #fca5a5; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #dc2626; margin-bottom: 8px; }
          .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #991b1b; font-family: 'Courier New', monospace; }
          .expiry-notice { font-size: 11px; color: #71717a; text-align: center; margin-top: 8px; font-weight: 600; }
          .security-box { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 14px; padding: 14px; margin-top: 24px; }
          .security-text { font-size: 11px; color: #71717a; margin: 0; line-height: 1.5; }
          .footer { background: #fafafa; border-top: 1px solid #f4f4f5; padding: 20px; text-align: center; font-size: 11px; color: #a1a1aa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">AD<span class="brand-red">HUNTER</span></div>
            <div class="subtitle">AI Creative & Social Ad Studio</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${name},</div>
            <div class="text">
              We received a request to reset the password for your AD-HUNTER account associated with <strong>${toEmail}</strong>. 
              Please enter the 6-digit verification code below to proceed with resetting your password.
            </div>

            <div class="otp-box">
              <div class="otp-label">Verification Code</div>
              <div class="otp-code">${otpCode}</div>
              <div class="expiry-notice">⏱️ Valid for 10 minutes only</div>
            </div>

            <div class="security-box">
              <p class="security-text">
                🔒 <strong>Security Warning:</strong> If you did not request this password reset, please ignore this email or contact support immediately. Never share this code with anyone.
              </p>
            </div>
          </div>

          <div class="footer">
            © ${new Date().getFullYear()} AD-HUNTER (ADS CREATOR) Inc. All rights reserved.<br>
            Automated security notification • Do not reply directly to this email
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const transporter = getTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: `[${otpCode}] Your AD-HUNTER Password Reset Code`,
        html: htmlContent
      });

      console.log(`[MAILER] OTP email sent successfully to ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log('====================================================');
      console.log(`[MAILER - LOCAL/DEV SIMULATION]`);
      console.log(`To: ${toEmail}`);
      console.log(`From: ${fromEmail}`);
      console.log(`SUBJECT: Password Reset Code: ${otpCode}`);
      console.log(`CODE: ${otpCode} (Valid for 10 minutes)`);
      console.log('Configure SMTP_USER and SMTP_PASS in backend/.env for real SMTP delivery.');
      console.log('====================================================');
      return { success: true, previewUrl: 'Console/Simulated' };
    }
  } catch (error: any) {
    console.error(`[MAILER ERROR] Failed to send email to ${toEmail}:`, error);
    // Still output code to server logs as fallback so user is never locked out
    console.log(`[MAILER FALLBACK CODE]: ${otpCode} for ${toEmail}`);
    return { success: false };
  }
};

export const sendPasswordResetSuccessEmail = async (
  toEmail: string,
  userName?: string
): Promise<boolean> => {
  const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_FROM || process.env.SMTP_USER || 'AD-HUNTER <no-reply@adhunter.ai>';
  const name = userName || 'Valued User';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful - AD-HUNTER</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
          .header { background: #09090b; padding: 32px 24px; text-align: center; color: #ffffff; }
          .brand { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .brand-red { color: #dc2626; }
          .content { padding: 32px 28px; text-align: center; }
          .success-icon { font-size: 48px; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: 900; color: #09090b; margin-bottom: 12px; }
          .text { font-size: 13px; line-height: 1.6; color: #52525b; margin-bottom: 24px; }
          .footer { background: #fafafa; border-top: 1px solid #f4f4f5; padding: 20px; text-align: center; font-size: 11px; color: #a1a1aa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">AD<span class="brand-red">HUNTER</span></div>
          </div>
          
          <div class="content">
            <div class="success-icon">✅</div>
            <div class="title">Password Reset Complete</div>
            <div class="text">
              Hello ${name}, your password for account <strong>${toEmail}</strong> was successfully changed on ${new Date().toUTCString()}.
              You can now login with your new password.
            </div>
          </div>

          <div class="footer">
            © ${new Date().getFullYear()} AD-HUNTER Inc. Security Team
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const transporter = getTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject: `Security Alert: Your AD-HUNTER Password Was Reset`,
        html: htmlContent
      });
      return true;
    }
    return true;
  } catch (error) {
    console.error(`[MAILER ERROR] Failed to send success email:`, error);
    return false;
  }
};
