import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Calendar, MapPin, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/events?search=${search}&category=${category}`);
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
        <h1 className="text-3xl font-bold mb-6 text-white">Upcoming Events</h1>
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
          <div key={event._id} className="glass-card overflow-hidden">
            {/* ✅ IMAGE DISPLAY – works with full URL or local path */}
            <img
              src={event.image && event.image.startsWith('http') 
                ? event.image 
                : event.image 
                  ? `http://localhost:5000${event.image}` 
                  : 'https://via.placeholder.com/400x200?text=No+Image'
              }
              alt={event.title}
              className="w-full h-48 object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error'; }}
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                </div>
                <div className="flex items-center text-gray-600">
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