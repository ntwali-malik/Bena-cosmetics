const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    saleDate: { type: Date, default: Date.now },
    unitPrice: { type: Number }, // optional: override product unitPrice
    totalPrice: { type: Number }, // optional: quantity * unitPrice
    customerName: { type: String }, // optional
    paymentMethod: { type: String, enum: ['cash', 'credit', 'mobile'], default: 'cash' }
  });
  
  module.exports = mongoose.model('Sale', saleSchema);
  