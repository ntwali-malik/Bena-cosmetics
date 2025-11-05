const router = require('express').Router();
const {
	createUser,
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
} = require('../controllers/usersController');

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;


