const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true, default: 0 },
    size: { type: String }, // e.g., small, medium, large, 500ml
    unitPrice: { type: Number, required: true },
    productionDate: { type: Date, required: true },
    expiryDate: { type: Date },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    status: { type: String, enum: ['available', 'expired', 'out-of-stock'], default: 'available' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Product', productSchema);
  