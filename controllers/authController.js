const User = require('../models/User');

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

module.exports = { login };


