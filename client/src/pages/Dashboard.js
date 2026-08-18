import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, DollarSign, CheckCircle, Clock, XCircle, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api, { API_URL } from '../services/api'; // ✅ uses environment variable

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [wishlistEvents, setWishlistEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    upcomingEvents: 0,
    attendedEvents: 0,
    cancelledEvents: 0
  });

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const [bookingsRes, wishlistRes] = await Promise.all([
        api.get('/api/bookings/my-bookings'),
        api.get('/api/auth/wishlist')
      ]);
      
      setBookings(bookingsRes.data);
      setWishlistEvents(wishlistRes.data);

      const activeBookings = bookingsRes.data.filter(booking => 
        booking.attendanceStatus !== 'cancelled'
      );
      const totalSpent = Math.round(activeBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0));
      
      const upcomingEventsCount = bookingsRes.data.filter(booking => 
        booking.attendanceStatus === 'pending'
      ).length;
      
      const attendedEventsCount = bookingsRes.data.filter(booking => 
        booking.attendanceStatus === 'attended'
      ).length;
      
      const cancelledEventsCount = bookingsRes.data.filter(booking => 
        booking.attendanceStatus === 'cancelled'
      ).length;
      
      setStats({
        totalBookings: activeBookings.length,
        totalSpent: totalSpent,
        upcomingEvents: upcomingEventsCount,
        attendedEvents: attendedEventsCount,
        cancelledEvents: cancelledEventsCount
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => b.attendanceStatus === 'pending');
  const attendedBookings = bookings.filter(b => b.attendanceStatus === 'attended');
  const cancelledBookings = bookings.filter(b => b.attendanceStatus === 'cancelled');

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="glass-card p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Welcome back, {user?.name}! 🎉</h1>
        <p className="text-gray-600 dark:text-gray-300">Here's what's happening with your events</p>
        {user?.role === 'admin' && (
          <div className="mt-3 inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
            Admin Account ✓
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card text-center">
          <Ticket className="w-12 h-12 mx-auto text-purple-600 mb-3" />
          <h3 className="text-3xl font-bold dark:text-white">{stats.totalBookings}</h3>
          <p className="text-gray-600 dark:text-gray-300">Active Bookings</p>
        </div>
        
        <div className="glass-card text-center">
          <DollarSign className="w-12 h-12 mx-auto text-purple-600 mb-3" />
          <h3 className="text-3xl font-bold dark:text-white">₹{stats.totalSpent}</h3>
          <p className="text-gray-600 dark:text-gray-300">Total Spent</p>
        </div>
        
        <div className="glass-card text-center">
          <Clock className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
          <h3 className="text-3xl font-bold dark:text-white">{stats.upcomingEvents}</h3>
          <p className="text-gray-600 dark:text-gray-300">Upcoming Events</p>
        </div>

        <div className="glass-card text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <h3 className="text-3xl font-bold dark:text-white">{stats.attendedEvents}</h3>
          <p className="text-gray-600 dark:text-gray-300">Events Attended</p>
        </div>
      </div>

      {/* Upcoming Events Section */}
      {upcomingBookings.length > 0 && (
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-white">
            <Clock className="w-6 h-6 text-yellow-500" />
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div key={booking._id} className="border rounded-lg p-4 hover:shadow-lg transition bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {booking.eventId?.title || 'Event'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.eventId?.date ? new Date(booking.eventId.date).toLocaleDateString() : 'Date TBD'} | ₹{Math.round(booking.amount)}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">⏳ Awaiting your attendance</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Upcoming
                    </span>
                    <Link 
                      to="/bookings" 
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      View Ticket →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attended Events Section */}
      {attendedBookings.length > 0 && (
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-white">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Past Events (Attended)
          </h2>
          <div className="space-y-4">
            {attendedBookings.map((booking) => (
              <div key={booking._id} className="border rounded-lg p-4 hover:shadow-lg transition bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {booking.eventId?.title || 'Event'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.eventId?.date ? new Date(booking.eventId.date).toLocaleDateString() : 'Date TBD'} | ₹{Math.round(booking.amount)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">✓ You attended this event</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Attended
                    </span>
                    <Link 
                      to="/bookings" 
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      View Ticket →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Events Section */}
      {cancelledBookings.length > 0 && (
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-white">
            <XCircle className="w-6 h-6 text-red-500" />
            Cancelled Bookings
          </h2>
          <div className="space-y-4">
            {cancelledBookings.map((booking) => (
              <div key={booking._id} className="border rounded-lg p-4 hover:shadow-lg transition bg-white dark:bg-gray-800 dark:border-gray-700 opacity-75">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {booking.eventId?.title || 'Event'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.eventId?.date ? new Date(booking.eventId.date).toLocaleDateString() : 'Date TBD'} | ₹{Math.round(booking.amount)}
                    </p>
                    <p className="text-xs text-red-600 mt-1">✗ Cancelled</p>
                  </div>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Cancelled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wishlist Section */}
      {wishlistEvents.length > 0 && (
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-white">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            My Wishlist
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {wishlistEvents.map((event) => (
              <div key={event._id} className="border rounded-lg p-4 hover:shadow-lg transition bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center gap-4">
                <img 
                  src={event.image ? (event.image.startsWith('http') ? event.image : `${API_URL}${event.image}`) : 'https://via.placeholder.com/100'} 
                  alt={event.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg dark:text-white">{event.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{new Date(event.date).toLocaleDateString()} | ₹{event.price}</p>
                  <Link to={`/events/${event._id}`} className="text-purple-600 hover:text-purple-400 text-sm font-medium mt-1 inline-block">
                    View Event →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Bookings & No Wishlist Message */}
      {bookings.length === 0 && wishlistEvents.length === 0 && (
        <div className="glass-card p-8 text-center mb-8">
          <Ticket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No bookings or saved events yet</p>
          <Link to="/events" className="btn-primary inline-block mt-4">
            Browse Events
          </Link>
        </div>
      )}

      {/* Quick Actions for Admin */}
      {user?.role === 'admin' && (
        <div className="glass-card p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Admin Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/admin" className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition">
              📊 Go to Admin Dashboard
            </Link>
            <button 
              onClick={() => window.location.href = '/events'}
              className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition"
            >
              ➕ Add New Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;