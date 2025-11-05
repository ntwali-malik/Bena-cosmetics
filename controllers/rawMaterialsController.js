const RawMaterial = require('../models/RawMaterials');

async function createRawMaterial(req, res) {
	try {
		const material = await RawMaterial.create(req.body);
		return res.status(201).json(material);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function getRawMaterials(_req, res) {
	try {
		const materials = await RawMaterial.find();
		return res.json(materials);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

async function getRawMaterialById(req, res) {
	try {
		const material = await RawMaterial.findById(req.params.id);
		if (!material) return res.status(404).json({ error: 'Raw material not found' });
		return res.json(material);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function updateRawMaterial(req, res) {
	try {
		const updated = await RawMaterial.findByIdAndUpdate(
			req.params.id,
			{ ...req.body, updatedAt: new Date() },
			{ new: true }
		);
		if (!updated) return res.status(404).json({ error: 'Raw material not found' });
		return res.json(updated);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function deleteRawMaterial(req, res) {
	try {
		const deleted = await RawMaterial.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Raw material not found' });
		return res.json({ message: 'Raw material deleted' });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

module.exports = { createRawMaterial, getRawMaterials, getRawMaterialById, updateRawMaterial, deleteRawMaterial };


