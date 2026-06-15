const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  amount: { type: Number, required: true },
  qrCode: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'completed' },
  attendanceStatus: { type: String, enum: ['pending', 'attended', 'cancelled'], default: 'pending' },
  bookingDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: 'credit_card' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);