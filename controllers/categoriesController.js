const Category = require('../models/Category');

async function createCategory(req, res) {
	try {
		const category = await Category.create(req.body);
		return res.status(201).json(category);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function getCategories(_req, res) {
	try {
		const categories = await Category.find();
		return res.json(categories);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

async function getCategoryById(req, res) {
	try {
		const category = await Category.findById(req.params.id);
		if (!category) return res.status(404).json({ error: 'Category not found' });
		return res.json(category);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function updateCategory(req, res) {
	try {
		const updated = await Category.findByIdAndUpdate(
			req.params.id,
			{ ...req.body, updatedAt: new Date() },
			{ new: true }
		);
		if (!updated) return res.status(404).json({ error: 'Category not found' });
		return res.json(updated);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function deleteCategory(req, res) {
	try {
		const deleted = await Category.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Category not found' });
		return res.json({ message: 'Category deleted' });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

module.exports = { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };


