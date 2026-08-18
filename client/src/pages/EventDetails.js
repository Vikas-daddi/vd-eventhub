import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Clock, Users, Ticket, CheckCircle, CreditCard, Smartphone, X, RefreshCw, Timer, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { API_URL } from '../services/api'; // ✅ uses environment variable

const EventDetails = () => {
  const { id } = useParams();
  const { user, toggleWishlist } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, hasPassed: false });

  const fetchEvent = useCallback(async () => {
    try {
      const response = await api.get(`/api/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      toast.error('Failed to load event');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const checkIfBooked = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;
      const response = await api.get('/api/bookings/my-bookings');
      const activeBooking = response.data.some(booking =>
        (booking.eventId?._id === id || booking.eventId === id) &&
        booking.attendanceStatus !== 'cancelled'
      );
      setAlreadyBooked(activeBooking);
    } catch (error) {
      console.error('Error checking booking:', error);
    }
  }, [id, user]);

  const calculateTimeLeft = useCallback(() => {
    if (!event) return;
    const eventDate = new Date(event.date);
    const now = new Date();
    if (now > eventDate) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, hasPassed: true });
      return;
    }
    const difference = eventDate - now;
    if (difference <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, hasPassed: false });
      return;
    }
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (86400000)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (3600000)) / (1000 * 60));
    const seconds = Math.floor((difference % (60000)) / 1000);
    setTimeLeft({ days, hours, minutes, seconds, isLive: false, hasPassed: false });
  }, [event]);

  useEffect(() => {
    if (!event) return;
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [event, calculateTimeLeft]);

  useEffect(() => {
    fetchEvent();
    if (user) checkIfBooked();
  }, [fetchEvent, checkIfBooked, user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        checkIfBooked();
        fetchEvent();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkIfBooked, fetchEvent, user]);

  const handleProceedToPayment = () => {
    if (!user) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }
    if (alreadyBooked) {
      toast.error('You have already booked this event!');
      return;
    }
    if (!event || event.availableSeats === 0) {
      toast.error('No seats available');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentAndBooking = async () => {
    if (alreadyBooked) {
      toast.error('You have already booked this event!');
      setShowPaymentModal(false);
      return;
    }
    if (!event || event.availableSeats === 0) {
      toast.error('Sorry, no seats available now.');
      setShowPaymentModal(false);
      return;
    }

    setProcessingPayment(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessingPayment(false);
    setShowPaymentModal(false);

    setBooking(true);
    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        eventId: id,
        amount: Number(event.price),
        paymentMethod: paymentMethod
      };
      const response = await api.post('/api/bookings', bookingData);
      if (response.data && (response.data.success === true || response.data.booking?._id || response.data._id)) {
        toast.success('Payment successful! Booking confirmed 🎉');
        setTimeout(() => navigate('/bookings'), 1500);
      } else {
        toast.error('Booking failed after payment');
      }
    } catch (error) {
      console.error('Booking error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const manualRefresh = () => {
    checkIfBooked();
    fetchEvent();
    toast.success('Booking status refreshed');
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(event._id);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="glass-card overflow-hidden">
        <div className="relative">
          <img
            src={event.image ? (event.image.startsWith('http') ? event.image : `${API_URL}${event.image}`) : 'https://via.placeholder.com/1200x400'}
            alt={event.title}
            className="w-full h-96 object-cover"
          />
          {user && (
            <button 
              onClick={handleWishlistToggle}
              className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors shadow-lg"
            >
              <Heart 
                className={`w-6 h-6 ${user.wishlist?.includes(event._id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
              />
            </button>
          )}
        </div>
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Timer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">Event starts in:</span>
            </div>
            {timeLeft.hasPassed ? (
              <span className="text-red-600 font-bold">⏰ Event has ended</span>
            ) : timeLeft.isLive ? (
              <span className="text-green-600 font-bold animate-pulse">🔴 LIVE NOW! Event is happening</span>
            ) : (
              <div className="flex gap-4 text-center">
                <div><div className="text-2xl font-bold text-purple-700">{timeLeft.days}</div><div className="text-xs text-gray-500">Days</div></div>
                <div><div className="text-2xl font-bold text-purple-700">{timeLeft.hours}</div><div className="text-xs text-gray-500">Hours</div></div>
                <div><div className="text-2xl font-bold text-purple-700">{timeLeft.minutes}</div><div className="text-xs text-gray-500">Minutes</div></div>
                <div><div className="text-2xl font-bold text-purple-700">{timeLeft.seconds}</div><div className="text-xs text-gray-500">Seconds</div></div>
              </div>
            )}
          </div>

          {alreadyBooked && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              You have already booked this event! &nbsp;
              <button onClick={manualRefresh} className="text-sm underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Not you? Refresh
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center text-gray-700 dark:text-gray-300"><Calendar className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" /><span className="font-semibold">Date:</span><span className="ml-2">{new Date(event.date).toLocaleDateString()}</span></div>
              <div className="flex items-center text-gray-700 dark:text-gray-300"><Clock className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" /><span className="font-semibold">Time:</span><span className="ml-2">{event.time}</span></div>
              <div className="flex items-center text-gray-700 dark:text-gray-300"><MapPin className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" /><span className="font-semibold">Venue:</span><span className="ml-2">{event.venue}</span></div>
              <div className="flex items-center text-gray-700 dark:text-gray-300"><DollarSign className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" /><span className="font-semibold">Price:</span><span className="ml-2 text-2xl font-bold text-purple-600 dark:text-purple-400">₹{event.price}</span></div>
              <div className="flex items-center text-gray-700 dark:text-gray-300"><Users className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" /><span className="font-semibold">Available Seats:</span><span className="ml-2">{event.availableSeats}</span></div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">About this event</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p>
              <div className="mt-4"><span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">{event.category}</span></div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={handleProceedToPayment}
              disabled={booking || event.availableSeats === 0 || alreadyBooked || timeLeft.hasPassed}
              className={`btn-primary px-12 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed ${alreadyBooked ? 'bg-green-500' : ''}`}
            >
              <Ticket className="w-5 h-5 inline mr-2" />
              {booking ? 'Processing...' : alreadyBooked ? '✓ Already Booked' : event.availableSeats === 0 ? 'Sold Out' : timeLeft.hasPassed ? 'Event Ended' : 'Book Now'}
            </button>
            <button onClick={manualRefresh} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg transition flex items-center gap-2" title="Refresh booking status">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Complete Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">Event: <span className="font-semibold">{event.title}</span></p>
              <p className="text-gray-600">Amount: <span className="font-semibold text-purple-600">₹{event.price}</span></p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Payment Method</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /><CreditCard className="w-5 h-5" /> Credit/Debit Card</label>
                <label className="flex items-center gap-2"><input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} /><Smartphone className="w-5 h-5" /> UPI</label>
              </div>
            </div>
            {paymentMethod === 'card' && (
              <div className="mb-4 space-y-3">
                <input type="text" placeholder="Card Number" className="w-full p-2 border rounded" disabled value="4111 1111 1111 1111" />
                <div className="flex gap-2"><input type="text" placeholder="MM/YY" className="w-1/2 p-2 border rounded" disabled value="12/28" /><input type="text" placeholder="CVV" className="w-1/2 p-2 border rounded" disabled value="123" /></div>
              </div>
            )}
            {paymentMethod === 'upi' && (
              <div className="mb-4"><input type="text" placeholder="UPI ID" className="w-full p-2 border rounded" disabled value="demo@okhdfcbank" /></div>
            )}
            <button onClick={handlePaymentAndBooking} disabled={processingPayment} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
              {processingPayment ? 'Processing Payment...' : `Pay ₹${event.price}`}
            </button>
            <p className="text-xs text-gray-400 text-center mt-4">🔒 Demo payment – no real charge.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;