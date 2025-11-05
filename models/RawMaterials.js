const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true }, // e.g., kg, liters, pieces
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
