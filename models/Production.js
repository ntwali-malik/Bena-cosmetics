const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantityProduced: { type: Number, required: true },
  productionDate: { type: Date, default: Date.now },
  materialsUsed: [
    {
      material: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
      quantityUsed: { type: Number, required: true },
      unit: { type: String } // optional for clarity
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Production', productionSchema);
