const User = require('../models/User');

async function createUser(req, res) {
	try {
		const user = new User(req.body);
		await user.save();
		const { password, ...safe } = user.toObject();
		return res.status(201).json(safe);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function getUsers(_req, res) {
	try {
		const users = await User.find().select('-password');
		return res.json(users);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

async function getUserById(req, res) {
	try {
		const user = await User.findById(req.params.id).select('-password');
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.json(user);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function updateUser(req, res) {
	try {
		const user = await User.findById(req.params.id);
		if (!user) return res.status(404).json({ error: 'User not found' });
		Object.assign(user, req.body, { updatedAt: new Date() });
		await user.save(); // triggers pre-save for password if modified
		const { password, ...safe } = user.toObject();
		return res.json(safe);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function deleteUser(req, res) {
	try {
		const deleted = await User.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'User not found' });
		return res.json({ message: 'User deleted' });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };


