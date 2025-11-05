const Product = require('../models/Products');

async function createProduct(req, res) {
	try {
		const product = await Product.create(req.body);
		return res.status(201).json(product);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function getProducts(_req, res) {
	try {
		const products = await Product.find().populate('category');
		return res.json(products);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

async function getProductById(req, res) {
	try {
		const product = await Product.findById(req.params.id).populate('category');
		if (!product) return res.status(404).json({ error: 'Product not found' });
		return res.json(product);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function updateProduct(req, res) {
	try {
		const updated = await Product.findByIdAndUpdate(
			req.params.id,
			{ ...req.body, updatedAt: new Date() },
			{ new: true }
		).populate('category');
		if (!updated) return res.status(404).json({ error: 'Product not found' });
		return res.json(updated);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function deleteProduct(req, res) {
	try {
		const deleted = await Product.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Product not found' });
		return res.json({ message: 'Product deleted' });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };


