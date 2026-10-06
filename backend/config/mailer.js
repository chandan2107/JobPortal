const https = require("https");

const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, "");
const SENDER_EMAIL = process.env.EMAIL_USER || "chandunaik2107@gmail.com";
const SENDER_NAME = "Job Portal";

/**
 * Generic email sender using Brevo HTTPS REST API (Port 443 - Never blocked on Render)
 */
const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured in environment variables.");
  }

  const recipients = (Array.isArray(to) ? to : [to]).map((email) => ({ email }));

  const payload = JSON.stringify({
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: recipients,
    subject,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
          "content-length": Buffer.byteLength(payload),
        },
        timeout: 15000,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(body);
              console.log(`✉️ [Brevo] Email sent to ${recipients.map((r) => r.email).join(", ")} | ID: ${parsed.messageId}`);
              resolve(parsed);
            } catch {
              resolve({ success: true });
            }
          } else {
            console.error(`❌ [Brevo] API Error (${res.statusCode}):`, body);
            reject(new Error(`Brevo API Error (${res.statusCode}): ${body}`));
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Brevo API request timed out"));
    });

    req.on("error", (err) => {
      console.error("❌ [Brevo] Network error:", err.message);
      reject(err);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Send an OTP email for login verification
 */
const sendOtpEmail = async (to, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { margin: 0; padding: 0; background: #f4f7ff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(59,130,246,0.10); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); padding: 36px 32px 28px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
          .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
          .body { padding: 36px 32px; }
          .body p { color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
          .otp-box { background: #f0f4ff; border: 2px dashed #93c5fd; border-radius: 12px; text-align: center; padding: 28px 16px; margin: 24px 0; }
          .otp-box span { display: block; font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #1d4ed8; font-family: monospace; }
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
            <p>© ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Your Login OTP - Job Portal",
    html,
  });
};

/**
 * Send employer verification request notification to admin
 */
const sendAdminVerificationRequestEmail = async (user) => {
  const adminEmail = process.env.ADMIN_EMAIL || "darkn8546@gmail.com";
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(99,102,241,.12);border:1px solid #e2e8f0;">
      <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:36px 32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px">📋 New Verification Request</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;font-size:15px">A new employer has requested company verification on Job Portal.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px">Company Name</td><td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px">${user.companyName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Employer Email</td><td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px">${user.email}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;font-size:14px">Employer Name</td><td style="padding:8px 0;color:#111827;font-weight:600;font-size:14px">${user.name}</td></tr>
        </table>
        <a href="${CLIENT_URL}/admin-login" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#6366f1;color:#fff;border-radius:10px;font-weight:600;text-decoration:none">Open Admin Panel →</a>
      </div>
      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">© ${new Date().getFullYear()} Job Portal</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `🔔 New Verification Request — ${user.companyName}`,
    html,
  });
};

/**
 * Send employer approval email
 */
const sendApprovalEmail = async (to, companyName) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(34,197,94,.12);border:1px solid #e2e8f0;">
      <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:36px 32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px">🎉 Verification Approved!</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;font-size:15px">Great news! <strong>${companyName}</strong> has been <strong>verified</strong> on Job Portal.</p>
        <p style="color:#374151;font-size:15px">You can now <strong>post jobs</strong> and start hiring talented professionals.</p>
        <a href="${CLIENT_URL}/post-job" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#22c55e;color:#fff;border-radius:10px;font-weight:600;text-decoration:none">Start Posting Jobs →</a>
      </div>
      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">© ${new Date().getFullYear()} Job Portal</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: "✅ Company Verification Approved — Job Portal",
    html,
  });
};

/**
 * Send employer rejection email
 */
const sendRejectionEmail = async (to, companyName, reason) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(239,68,68,.12);border:1px solid #e2e8f0;">
      <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:36px 32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px">Verification Update</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#374151;font-size:15px">We reviewed your verification request for <strong>${companyName}</strong>.</p>
        <p style="color:#374151;font-size:15px">Unfortunately, your request could not be approved at this time.</p>
        <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:4px;margin:16px 0">
          <p style="color:#991b1b;font-size:14px;margin:0"><strong>Reason:</strong> ${reason}</p>
        </div>
        <p style="color:#6b7280;font-size:13px">You may update your company details in your profile and request verification again.</p>
        <a href="${CLIENT_URL}/employer-profile" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#374151;color:#fff;border-radius:10px;font-weight:600;text-decoration:none">Review Profile →</a>
      </div>
      <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center">
        <p style="color:#9ca3af;font-size:12px;margin:0">© ${new Date().getFullYear()} Job Portal</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Update Regarding Your Company Verification — Job Portal",
    html,
  });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendAdminVerificationRequestEmail,
  sendApprovalEmail,
  sendRejectionEmail,
};
