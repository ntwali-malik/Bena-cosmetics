const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number } // quantity * unitPrice
});

const saleSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    items: { type: [saleItemSchema], required: true, default: [] },
    saleDate: { type: Date, default: Date.now },
    customerName: { type: String },
    paymentMethod: { type: String, enum: ['cash', 'credit', 'mobile'], default: 'cash' },
    totalAmount: { type: Number },
  });
  
  module.exports = mongoose.model('Sale', saleSchema);
  