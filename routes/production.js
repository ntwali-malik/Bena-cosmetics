const router = require('express').Router();
const {
	createProduction,
	getProductions,
	getProductionById,
	updateProduction,
	deleteProduction,
} = require('../controllers/productionController');

router.post('/', createProduction);
router.get('/', getProductions);
router.get('/:id', getProductionById);
router.put('/:id', updateProduction);
router.delete('/:id', deleteProduction);

module.exports = router;


