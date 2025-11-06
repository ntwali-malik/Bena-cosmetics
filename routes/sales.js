const router = require('express').Router();
const {
	createSale,
	getSales,
	getSaleById,
	updateSale,
	deleteSale,
	peekNextInvoiceNumber,
} = require('../controllers/salesController');

router.get('/next-invoice', peekNextInvoiceNumber);
router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);
router.put('/:id', updateSale);
router.delete('/:id', deleteSale);

module.exports = router;


