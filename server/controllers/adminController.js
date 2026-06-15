const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const allBookings = await Booking.find();
    const totalRevenue = allBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const attended = await Booking.countDocuments({ attendanceStatus: 'attended' });
    const attendancePercentage = totalBookings ? Math.round((attended / totalBookings) * 100) : 0;

    res.json({ totalUsers, totalEvents, totalBookings, totalRevenue, attendancePercentage });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    // Fetch all bookings without populate first to avoid reference errors
    const bookings = await Booking.find().sort({ bookingDate: -1 });
    
    // Manually enrich each booking with user and event names (safe)
    const enriched = await Promise.all(bookings.map(async (booking) => {
      let userName = 'Unknown', userEmail = '';
      let eventTitle = 'Deleted Event', eventDate = null, eventVenue = '', eventPrice = 0;
      
      try {
        const user = await User.findById(booking.userId);
        if (user) {
          userName = user.name;
          userEmail = user.email;
        }
      } catch (e) {}
      
      try {
        const event = await Event.findById(booking.eventId);
        if (event) {
          eventTitle = event.title;
          eventDate = event.date;
          eventVenue = event.venue;
          eventPrice = event.price;
        }
      } catch (e) {}
      
      return {
        ...booking.toObject(),
        userId: { name: userName, email: userEmail },
        eventId: { title: eventTitle, date: eventDate, venue: eventVenue, price: eventPrice }
      };
    }));
    
    res.json(enriched);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: error.message });
  }
};