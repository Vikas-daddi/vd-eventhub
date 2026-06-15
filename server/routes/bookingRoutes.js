const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, cancelBooking, scanQR } = require('../controllers/bookingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes (none)

// Protected user routes
router.post('/', authMiddleware, createBooking);
router.get('/my-bookings', authMiddleware, getUserBookings);
router.put('/cancel/:id', authMiddleware, cancelBooking);

// Admin route - QR SCANNER
router.post('/scan-qr', authMiddleware, adminMiddleware, scanQR);

console.log('✅ BOOKING ROUTES LOADED - scan-qr endpoint is available at POST /api/bookings/scan-qr');

module.exports = router;