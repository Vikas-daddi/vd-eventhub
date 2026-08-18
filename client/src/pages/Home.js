import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, Award, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const { user, toggleWishlist } = useAuth();

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const response = await api.get('/api/events');
      const today = new Date();
      const upcoming = response.data
        .filter(event => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);
      setEvents(upcoming);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load upcoming events');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleWishlistToggle = async (eventId) => {
    try {
      await toggleWishlist(eventId);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Smart Event Management
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Discover, Book, and Experience Amazing Events with QR Ticketing
          </p>
          <Link to="/events" className="btn-primary inline-block text-lg">
            Explore All Events
          </Link>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">
          Upcoming Events
        </h2>
        {loadingEvents ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-white text-lg py-12">
            No upcoming events at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              // Image handling fix
              const imageUrl = event.image 
                ? (event.image.startsWith('http') ? event.image : `${API_URL}${event.image}`) 
                : 'https://via.placeholder.com/400x200?text=Event';
              return (
                <div key={event._id} className="glass-card overflow-hidden hover:scale-105 transition-transform duration-300 relative group">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error'; }}
                    />
                    {user && (
                      <button 
                        onClick={() => handleWishlistToggle(event._id)}
                        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors z-20"
                      >
                        <Heart 
                          className={`w-5 h-5 ${user.wishlist?.includes(event._id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                        />
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2 text-purple-600 line-clamp-1">{event.title}</h3>
                    <div className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                        <span className="text-xs">at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span className="text-sm line-clamp-1">{event.venue}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-2xl font-bold text-purple-600">₹{event.price}</span>
                        <Link to={`/events/${event._id}`} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm">
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {events.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/events" className="text-purple-300 hover:text-purple-100 underline">
              View all events →
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 bg-white/5 rounded-3xl my-8">
        <h2 className="text-4xl font-bold text-center mb-12 text-white">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card text-center">
            <Calendar className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-3 dark:text-white">Easy Booking</h3>
            <p className="text-gray-600 dark:text-gray-300">Book tickets in seconds with our simple and secure system</p>
          </div>
          <div className="glass-card text-center">
            <Ticket className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-3 dark:text-white">QR Tickets</h3>
            <p className="text-gray-600 dark:text-gray-300">Download QR tickets as PNG or PDF for easy check-in</p>
          </div>
          <div className="glass-card text-center">
            <Award className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-3 dark:text-white">Best Events</h3>
            <p className="text-gray-600 dark:text-gray-300">Curated selection of the best events in town</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">EventHub</h3>
              <p className="text-sm">Your one‑stop platform for discovering and booking the most exciting events.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/events" className="hover:text-purple-400">Events</Link></li>
                <li><Link to="/dashboard" className="hover:text-purple-400">Dashboard</Link></li>
                <li><Link to="/bookings" className="hover:text-purple-400">My Tickets</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
              <p className="text-sm"><Mail className="inline w-4 h-4 mr-2" /> support@eventhub.com</p>
              <p className="text-sm"><Phone className="inline w-4 h-4 mr-2" /> +91 98765 43210</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
              <div className="flex gap-3">
                <a href="#" className="hover:text-purple-400"><Facebook size={20} /></a>
                <a href="#" className="hover:text-purple-400"><Twitter size={20} /></a>
                <a href="#" className="hover:text-purple-400"><Instagram size={20} /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
            &copy; {new Date().getFullYear()} EventHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;