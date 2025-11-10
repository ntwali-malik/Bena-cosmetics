const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { login, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/login', login);

// Apply a modest rate limit to forgot password to prevent abuse
const forgotLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 5,
	standardHeaders: true,
	legacyHeaders: false
});

router.post('/forgot', forgotLimiter, forgotPassword);
router.post('/reset', resetPassword);

module.exports = router;


