const router = require('express').Router();
const {
	createRawMaterial,
	getRawMaterials,
	getRawMaterialById,
	updateRawMaterial,
	deleteRawMaterial,
} = require('../controllers/rawMaterialsController');

router.post('/', createRawMaterial);
router.get('/', getRawMaterials);
router.get('/:id', getRawMaterialById);
router.put('/:id', updateRawMaterial);
router.delete('/:id', deleteRawMaterial);

module.exports = router;


