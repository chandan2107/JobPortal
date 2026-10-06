const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an OTP email to the given address.
 * @param {string} to   - Recipient email
 * @param {string} otp  - Plain-text 6-digit OTP
 */
const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Job Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Login OTP - Job Portal",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { margin: 0; padding: 0; background: #f4f7ff; font-family: 'Segoe UI', sans-serif; }
            .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(59,130,246,0.10); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 36px 32px 28px; text-align: center; }
            .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
            .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
            .body { padding: 36px 32px; }
            .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
            .otp-box { background: #f0f4ff; border: 2px dashed #93c5fd; border-radius: 12px; text-align: center; padding: 28px 16px; margin: 24px 0; }
            .otp-box span { display: block; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #1d4ed8; font-family: monospace; }
            .otp-box small { display: block; margin-top: 10px; color: #6b7280; font-size: 13px; }
            .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 18px 32px; text-align: center; }
            .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>🔐 Login Verification</h1>
              <p>Job Portal Security Code</p>
            </div>
            <div class="body">
              <p>Hi there,</p>
              <p>We received a login request for your account. Use the OTP below to complete your sign-in. <strong>Do not share this code with anyone.</strong></p>
              <div class="otp-box">
                <span>${otp}</span>
                <small>Expires in 5 minutes</small>
              </div>
              <p>If you didn't request this, you can safely ignore this email — your account remains secure.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Job Portal. This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
