const nodemailer = require('nodemailer');

function createTransport() {
	const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
	if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
		console.warn('[mailer] SMTP env vars are not fully set. Emails will likely fail.');
	}
	const port = Number(SMTP_PORT) || 587;
	const secure = String(SMTP_SECURE).toLowerCase() === 'true' || port === 465;
	return nodemailer.createTransport({
		host: SMTP_HOST,
		port,
		secure,
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASS
		}
	});
}

async function sendEmail({ to, subject, html, text }) {
	const transporter = createTransport();
	const fromName = process.env.APP_NAME || 'Bena Cosmetics';
	const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
	const from = `${fromName} <${fromEmail}>`;
	return transporter.sendMail({ from, to, subject, html, text });
}

function buildResetPasswordHtml({ resetUrl }) {
	const clientUrl = process.env.CLIENT_URL || '';
	const appName = process.env.APP_NAME || 'Bena Cosmetics';
	const logoUrl = `${clientUrl}/logo.png`;
	return `
<div style="font-family: Arial, sans-serif; background:#f7f9f8; padding:12px;">
  <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="padding:12px; display:flex; align-items:center; gap:8px; background:#e6f4ea;">
      <img src="${logoUrl}" alt="${appName} logo" style="height:24px;" />
      <strong style="color:#1b5e20;">Bena Cosmetics Ltd</strong>
    </div>
    <div style="padding:16px;">
      <h2 style="margin:0 0 8px 0; color:#1b5e20; font-size:20px;">Reset your password</h2>
      <p style="margin:0 0 12px 0; color:#333; line-height:1.35;">We received a request to reset your password. Click the button below to set a new password. This link will expire in 60 minutes.</p>
      <div style="margin:16px 0;">
        <a href="${resetUrl}" style="background:#2e7d32; color:white; text-decoration:none; padding:10px 14px; border-radius:6px; display:inline-block;">Reset password</a>
      </div>
      <p style="margin:0; color:#555; font-size:13px; line-height:1.35;">If you didn’t request this, you can safely ignore this email.</p>
    </div>
    <div style="padding:10px; background:#f0f4f1; color:#666; font-size:12px; text-align:center;">
      © ${new Date().getFullYear()} ${appName}
    </div>
  </div>
  <p style="font-size:12px; color:#777; max-width:560px; margin:6px auto 0 auto;">If the button doesn’t work, copy and paste this URL into your browser: ${resetUrl}</p>
`;
}

async function sendPasswordResetEmail({ to, resetUrl }) {
	const subject = 'Reset your password';
	const html = buildResetPasswordHtml({ resetUrl });
	const text = `Reset your password: ${resetUrl}\n\nIf you didn’t request this, you can ignore this email.`;
	return sendEmail({ to, subject, html, text });
}

module.exports = {
	sendEmail,
	sendPasswordResetEmail
};


