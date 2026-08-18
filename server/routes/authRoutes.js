const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, toggleWishlist, getWishlist } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);
router.put('/wishlist/:eventId', authMiddleware, toggleWishlist);
router.get('/wishlist', authMiddleware, getWishlist);

console.log('✅ Auth routes loaded');

module.exports = router;