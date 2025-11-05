const mongoose = require('mongoose');

async function connectDB() {
	const mongoUri = process.env.MONGO_URI;
	if (!mongoUri) {
		throw new Error('MONGO_URI is not defined in environment variables');
	}
	try {
		await mongoose.connect(mongoUri, {
			// modern mongoose uses defaults; keep explicit if needed later
		});
		console.log('MongoDB connected');
	} catch (error) {
		console.error('MongoDB connection error:', error.message);
		process.exit(1);
	}
}

module.exports = { connectDB };


