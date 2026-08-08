import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, Award, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; // ✅ uses the api instance

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

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

  // ... rest of your component (hero, features, footer)
};