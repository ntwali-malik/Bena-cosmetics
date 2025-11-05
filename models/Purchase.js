const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
    quantity: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    unitPrice: { type: Number }, // optional: to record the price at purchase
    totalCost: { type: Number }, // calculated: quantity * unitPrice
    supplier: { type: String } // optional: override from RawMaterials if needed
  });
  
  module.exports = mongoose.model('Purchase', purchaseSchema);
  