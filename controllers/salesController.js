const Sale = require('../models/Sale');
const Product = require('../models/Products');
const Counter = require('../models/Counter');

function formatDateYYYYMMDD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
}

async function getNextInvoiceNumberInternal() {
    const today = new Date();
    const dayKey = formatDateYYYYMMDD(today);
    const counterId = `invoice_${dayKey}`;
    const updated = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const seqStr = String(updated.seq).padStart(4, '0');
    return `INV-${dayKey}-${seqStr}`;
}

async function peekNextInvoiceNumber(_req, res) {
    try {
        const today = new Date();
        const dayKey = formatDateYYYYMMDD(today);
        const counterId = `invoice_${dayKey}`;
        const doc = await Counter.findById(counterId);
        const nextSeq = (doc ? doc.seq : 0) + 1;
        const seqStr = String(nextSeq).padStart(4, '0');
        const invoiceNumber = `INV-${dayKey}-${seqStr}`;
        return res.json({ invoiceNumber });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function createSale(req, res) {
    try {
        const { items, customerName, paymentMethod, saleDate } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'items must be a non-empty array' });
        }
        const normalizedItems = items.map(i => ({
            product: i.product,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: typeof i.quantity === 'number' && typeof i.unitPrice === 'number'
                ? i.quantity * i.unitPrice
                : i.lineTotal,
        }));
        const totalAmount = normalizedItems.reduce((s, i) => s + (i.lineTotal || 0), 0);
        // Validate stock first
        for (const it of normalizedItems) {
            const prod = await Product.findById(it.product);
            if (!prod) return res.status(400).json({ error: 'Invalid product in items' });
            if (typeof it.quantity !== 'number' || it.quantity <= 0) {
                return res.status(400).json({ error: 'Each item quantity must be a positive number' });
            }
            if (prod.quantity < it.quantity) {
                return res.status(400).json({ error: `Insufficient stock for product ${prod.name}` });
            }
        }
        // Decrement stock
        for (const it of normalizedItems) {
            await Product.findByIdAndUpdate(it.product, { $inc: { quantity: -it.quantity }, $set: { updatedAt: new Date() } });
        }
        const invoiceNumber = await getNextInvoiceNumberInternal();
        const sale = await Sale.create({ invoiceNumber, items: normalizedItems, customerName, paymentMethod, saleDate, totalAmount });
        return res.status(201).json(sale);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

async function getSales(_req, res) {
	try {
    const sales = await Sale.find().populate('items.product');
		return res.json(sales);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

async function getSaleById(req, res) {
	try {
    const sale = await Sale.findById(req.params.id).populate('items.product');
		if (!sale) return res.status(404).json({ error: 'Sale not found' });
		return res.json(sale);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function updateSale(req, res) {
	try {
    const existing = await Sale.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Sale not found' });

    const incoming = { ...req.body };
    if (Array.isArray(incoming.items)) {
        incoming.items = incoming.items.map(i => ({
            product: i.product,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: typeof i.quantity === 'number' && typeof i.unitPrice === 'number' ? i.quantity * i.unitPrice : i.lineTotal,
        }));
        incoming.totalAmount = incoming.items.reduce((s, i) => s + (i.lineTotal || 0), 0);
    }

    // Compute stock adjustments if items provided
    if (Array.isArray(incoming.items)) {
        const oldMap = new Map();
        for (const it of existing.items) {
            const key = String(it.product);
            oldMap.set(key, (oldMap.get(key) || 0) + it.quantity);
        }
        const newMap = new Map();
        for (const it of incoming.items) {
            const key = String(it.product);
            newMap.set(key, (newMap.get(key) || 0) + it.quantity);
        }
        // Validate increases
        for (const [prodId, newQty] of newMap.entries()) {
            const oldQty = oldMap.get(prodId) || 0;
            const delta = newQty - oldQty; // positive means need to take more stock
            if (delta > 0) {
                const prod = await Product.findById(prodId);
                if (!prod) return res.status(400).json({ error: 'Invalid product in items' });
                if (prod.quantity < delta) {
                    return res.status(400).json({ error: `Insufficient stock for product ${prod.name}` });
                }
            }
        }
        // Apply adjustments
        // For products present in either old or new, inc by (oldQty - newQty)
        const productIds = new Set([...oldMap.keys(), ...newMap.keys()]);
        for (const prodId of productIds) {
            const oldQty = oldMap.get(prodId) || 0;
            const newQty = newMap.get(prodId) || 0;
            const inc = oldQty - newQty; // if positive -> return stock; if negative -> consume stock
            if (inc !== 0) {
                await Product.findByIdAndUpdate(prodId, { $inc: { quantity: inc }, $set: { updatedAt: new Date() } });
            }
        }
    }

    const updated = await Sale.findByIdAndUpdate(req.params.id, incoming, { new: true }).populate('items.product');
		if (!updated) return res.status(404).json({ error: 'Sale not found' });
		return res.json(updated);
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

async function deleteSale(req, res) {
	try {
        const existing = await Sale.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Sale not found' });
        // Restore stock
        for (const it of existing.items) {
            await Product.findByIdAndUpdate(it.product, { $inc: { quantity: it.quantity }, $set: { updatedAt: new Date() } });
        }
        const deleted = await Sale.findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Sale not found' });
		return res.json({ message: 'Sale deleted' });
	} catch (err) {
		return res.status(400).json({ error: err.message });
	}
}

module.exports = { createSale, getSales, getSaleById, updateSale, deleteSale, peekNextInvoiceNumber };


