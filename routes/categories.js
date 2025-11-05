const router = require('express').Router();
const {
	createCategory,
	getCategories,
	getCategoryById,
	updateCategory,
	deleteCategory,
} = require('../controllers/categoriesController');

router.post('/', createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;


