const router = require('express').Router();
const {
	createSale,
	getSales,
	getSaleById,
	updateSale,
	deleteSale,
} = require('../controllers/salesController');

router.post('/', createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);
router.put('/:id', updateSale);
router.delete('/:id', deleteSale);

module.exports = router;


