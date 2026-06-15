const express = require('express');
const router = express.Router();
const { getAllUsers, getDashboardStats, getAllBookings } = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Protect all admin routes
router.use(authMiddleware, adminMiddleware);

router.get('/users', getAllUsers);
router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);

module.exports = router;