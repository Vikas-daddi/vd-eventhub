import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, DollarSign, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { API_URL } from '../services/api'; // ✅ uses environment variable
import { useAuth } from '../context/AuthContext';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { user, toggleWishlist } = useAuth();

  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.get(`/api/events?search=${search}&category=${category}`);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleWishlistToggle = async (eventId) => {
    try {
      await toggleWishlist(eventId);
    } catch (error) {
      console.error(error);
    }
  };

  const categories = ['all', 'Conference', 'Workshop', 'Concert', 'Seminar', 'Sports', 'Other'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-card p-6 mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Upcoming Events</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field md:w-48"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="glass-card overflow-hidden relative group">
            <div className="relative">
              <img 
                src={event.image ? (event.image.startsWith('http') ? event.image : `${API_URL}${event.image}`) : 'https://via.placeholder.com/400x200'} 
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              {user && (
                <button 
                  onClick={() => handleWishlistToggle(event._id)}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors"
                >
                  <Heart 
                    className={`w-5 h-5 ${user.wishlist?.includes(event._id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                  />
                </button>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 dark:text-white">{event.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{event.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center text-purple-600 font-bold">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>₹{event.price}</span>
                </div>
              </div>
              <Link 
                to={`/events/${event._id}`}
                className="btn-primary inline-block w-full text-center"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center text-white text-xl py-12">
          No events found
        </div>
      )}
    </div>
  );
};

export default Events;