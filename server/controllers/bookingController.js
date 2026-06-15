const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');

exports.createBooking = async (req, res) => {
  try {
    const { eventId, amount, paymentMethod } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const existing = await Booking.findOne({
      userId: req.user.id,
      eventId,
      attendanceStatus: { $ne: 'cancelled' }
    });
    if (existing) return res.status(400).json({ message: 'You have already booked this event!' });

    if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

    const booking = new Booking({
      userId: req.user.id,
      eventId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'credit_card',
      paymentStatus: 'completed',
      attendanceStatus: 'pending'
    });
    await booking.save();

    const qrCode = await QRCode.toDataURL(booking._id.toString());
    booking.qrCode = qrCode;
    await booking.save();

    event.availableSeats -= 1;
    await event.save();

    res.status(201).json({ success: true, message: 'Booking successful', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('eventId')
      .sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Unauthorized' });

    if (booking.attendanceStatus === 'attended')
      return res.status(400).json({ message: 'Cannot cancel attended event' });
    if (booking.attendanceStatus === 'cancelled')
      return res.status(400).json({ message: 'Already cancelled' });

    const event = await Event.findById(booking.eventId);
    if (event) {
      event.availableSeats += 1;
      await event.save();
    }

    booking.attendanceStatus = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ The fixed scanQR function – tries _id first
exports.scanQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    console.log('📷 Manual check‑in input:', qrData);

    let booking = null;

    // 1️⃣ Try as a MongoDB ObjectId (the full 24‑character ID from your ticket)
    if (qrData && qrData.length === 24 && /^[0-9a-fA-F]{24}$/.test(qrData)) {
      booking = await Booking.findById(qrData).populate('eventId');
      if (booking) console.log('✅ Found by booking _id');
    }

    // 2️⃣ Try by the qrCode field
    if (!booking && qrData) {
      booking = await Booking.findOne({ qrCode: qrData }).populate('eventId');
      if (booking) console.log('✅ Found by qrCode field');
    }

    // 3️⃣ Try old format: userId-eventId-timestamp
    if (!booking && qrData && qrData.includes('-')) {
      const parts = qrData.split('-');
      if (parts.length >= 2) {
        booking = await Booking.findOne({ userId: parts[0], eventId: parts[1] }).populate('eventId');
        if (booking) console.log('✅ Found by old format');
      }
    }

    if (!booking) {
      console.log('❌ No booking found for:', qrData);
      return res.status(404).json({ message: 'Booking not found. Please check the full Booking ID.' });
    }

    if (booking.attendanceStatus === 'attended') {
      return res.status(400).json({ message: 'Already marked as attended' });
    }
    if (booking.attendanceStatus === 'cancelled') {
      return res.status(400).json({ message: 'Booking is cancelled' });
    }

    booking.attendanceStatus = 'attended';
    await booking.save();

    res.json({ success: true, message: `✅ Attendance marked for ${booking.eventId?.title}` });
  } catch (error) {
    console.error('Scan QR error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};