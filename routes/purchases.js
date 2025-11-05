const router = require('express').Router();
const {
	createPurchase,
	getPurchases,
	getPurchaseById,
	updatePurchase,
	deletePurchase,
} = require('../controllers/purchasesController');

router.post('/', createPurchase);
router.get('/', getPurchases);
router.get('/:id', getPurchaseById);
router.put('/:id', updatePurchase);
router.delete('/:id', deletePurchase);

module.exports = router;


