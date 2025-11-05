const Purchase = require('../models/Purchase');

async function createPurchase(req, res) {
	try {
		const purchase = await Purchase.create(req.body);
		return res.status(201).json(purchase);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function getPurchases(_req, res) {
	try {
		const purchases = await Purchase.find().populate('material');
		return res.json(purchases);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

async function getPurchaseById(req, res) {
	try {
		const purchase = await Purchase.findById(req.params.id).populate('material');
		if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
		return res.json(purchase);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function updatePurchase(req, res) {
	try {
		const updated = await Purchase.findByIdAndUpdate(
			req.params.id,
			{ ...req.body },
			{ new: true }
		).populate('material');
		if (!updated) return res.status(404).json({ error: 'Purchase not found' });
		return res.json(updated);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function deletePurchase(req, res) {
	try {
		const deleted = await Purchase.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Purchase not found' });
		return res.json({ message: 'Purchase deleted' });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

module.exports = { createPurchase, getPurchases, getPurchaseById, updatePurchase, deletePurchase };


