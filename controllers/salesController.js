const Sale = require('../models/Sale');

async function createSale(req, res) {
	try {
		const sale = await Sale.create(req.body);
		return res.status(201).json(sale);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function getSales(_req, res) {
	try {
		const sales = await Sale.find().populate('product');
		return res.json(sales);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

async function getSaleById(req, res) {
	try {
		const sale = await Sale.findById(req.params.id).populate('product');
		if (!sale) return res.status(404).json({ error: 'Sale not found' });
		return res.json(sale);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function updateSale(req, res) {
	try {
		const updated = await Sale.findByIdAndUpdate(
			req.params.id,
			{ ...req.body },
			{ new: true }
		).populate('product');
		if (!updated) return res.status(404).json({ error: 'Sale not found' });
		return res.json(updated);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function deleteSale(req, res) {
	try {
		const deleted = await Sale.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Sale not found' });
		return res.json({ message: 'Sale deleted' });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

module.exports = { createSale, getSales, getSaleById, updateSale, deleteSale };


