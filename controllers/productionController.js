const Production = require('../models/Production');

async function createProduction(req, res) {
	try {
		const production = await Production.create(req.body);
		return res.status(201).json(production);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function getProductions(_req, res) {
	try {
		const productions = await Production.find()
			.populate('product')
			.populate('materialsUsed.material');
		return res.json(productions);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

async function getProductionById(req, res) {
	try {
		const production = await Production.findById(req.params.id)
			.populate('product')
			.populate('materialsUsed.material');
		if (!production) return res.status(404).json({ error: 'Production not found' });
		return res.json(production);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function updateProduction(req, res) {
	try {
		const updated = await Production.findByIdAndUpdate(
			req.params.id,
			{ ...req.body, updatedAt: new Date() },
			{ new: true }
		)
			.populate('product')
			.populate('materialsUsed.material');
		if (!updated) return res.status(404).json({ error: 'Production not found' });
		return res.json(updated);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function deleteProduction(req, res) {
	try {
		const deleted = await Production.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Production not found' });
		return res.json({ message: 'Production deleted' });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

module.exports = { createProduction, getProductions, getProductionById, updateProduction, deleteProduction };


