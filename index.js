const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
	return res.json({ status: 'ok' });
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/raw-materials', require('./routes/rawMaterials'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/sales', require('./routes/sales'));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
});


