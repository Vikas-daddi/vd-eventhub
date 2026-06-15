const express = require('express');
const router = express.Router();
const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/eventController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Admin only routes (require authentication and admin role)
router.post('/', authMiddleware, adminMiddleware, createEvent);
router.put('/:id', authMiddleware, adminMiddleware, updateEvent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEvent);

console.log('✅ Event routes loaded');

module.exports = router;