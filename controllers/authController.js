const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/mailer');

async function login(req, res) {
	try {
		const { email, username, password } = req.body;
		if ((!email && !username) || !password) {
			return res.status(400).json({ error: 'email or username and password are required' });
		}
		const query = email ? { email } : { username };
		const user = await User.findOne(query);
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const ok = await user.comparePassword(password);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
		const { password: _pw, ...safe } = user.toObject();
		return res.json({ user: safe });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
}

function isValidPassword(pw) {
	// min 8 chars, at least one letter and one number/special
	return typeof pw === 'string' && pw.length >= 8 && /[A-Za-z]/.test(pw) && /[\d\W_]/.test(pw);
}

async function forgotPassword(req, res) {
	const genericMsg = 'If an account exists for that email, you will receive a reset link shortly.';
	try {
		const { email } = req.body || {};
		if (!email || !isValidEmail(email)) {
			// Still respond 200 to avoid email enumeration
			console.log('[audit] forgotPassword invalid email format');
			return res.status(200).json({ message: genericMsg });
		}

		// Rate limit will be applied at route level; add basic audit
		console.log('[audit] forgotPassword requested for email:', email);

		const user = await User.findOne({ email });
		if (!user) {
			// Do not reveal existence
			return res.status(200).json({ message: genericMsg });
		}

		const rawToken = crypto.randomBytes(32).toString('hex');
		const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
		const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

		user.resetPasswordTokenHash = tokenHash;
		user.resetPasswordExpires = expiresAt;
		await user.save();

		const clientUrl = process.env.CLIENT_URL;
		const encodedEmail = encodeURIComponent(email);
		const resetUrl = `${clientUrl}/reset-password?token=${rawToken}&email=${encodedEmail}`;

		// Fire-and-forget; still return success even if it throws
		sendPasswordResetEmail({ to: email, resetUrl }).catch(err => {
			console.error('[mailer] failed to send reset email:', err?.message);
		});

		return res.status(200).json({ message: genericMsg });
	} catch (err) {
		console.error('[forgotPassword] error:', err);
		// Still do not reveal details
		return res.status(200).json({ message: genericMsg });
	}
}

async function resetPassword(req, res) {
	try {
		const { email, token, password } = req.body || {};
		if (!email || !isValidEmail(email) || !token || !password) {
			return res.status(400).json({ error: 'Invalid request' });
		}
		if (!isValidPassword(password)) {
			return res.status(400).json({ error: 'Password must be at least 8 characters and include letters and numbers/symbols' });
		}

		const user = await User.findOne({ email });
		if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpires) {
			// generic failure
			return res.status(400).json({ error: 'Invalid or expired token' });
		}

		const providedHash = crypto.createHash('sha256').update(String(token)).digest('hex');
		const isMatch = crypto.timingSafeEqual(
			Buffer.from(providedHash, 'hex'),
			Buffer.from(user.resetPasswordTokenHash, 'hex')
		);
		const isExpired = user.resetPasswordExpires.getTime() < Date.now();

		if (!isMatch || isExpired) {
			return res.status(400).json({ error: 'Invalid or expired token' });
		}

		// Hash new password with bcrypt (10-12 rounds)
		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(password, salt);

		user.password = hashed;
		user.resetPasswordTokenHash = null;
		user.resetPasswordExpires = null;
		await user.save();

		// Optional: invalidate sessions if using sessions/JWTs (not implemented here)
		console.log('[audit] password reset for email:', email);

		return res.status(200).json({ message: 'Password has been reset successfully' });
	} catch (err) {
		console.error('[resetPassword] error:', err);
		return res.status(500).json({ error: 'Something went wrong' });
	}
}

module.exports = { login, forgotPassword, resetPassword };


