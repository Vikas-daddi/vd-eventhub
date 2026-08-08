import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Download, Eye, Trash2, Ticket, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api'; // ✅ uses environment variable

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/bookings/my-bookings');
      setBookings(response.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const downloadPNG = (qrCode, bookingId) => {
    const link = document.createElement('a');
    link.download = `qrcode-${bookingId}.png`;
    link.href = qrCode;
    link.click();
    toast.success('QR Code downloaded!');
  };

  const downloadPDF = async (booking, qrCode) => {
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      const doc = new jsPDF();
      
      doc.setFillColor(128, 90, 213);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('EVENT TICKET', 20, 25);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.text(`Event: ${booking.eventId?.title || 'Event'}`, 20, 60);
      doc.setFontSize(12);
      doc.text(`Date: ${booking.eventId?.date ? new Date(booking.eventId.date).toLocaleDateString() : 'TBD'}`, 20, 80);
      doc.text(`Time: ${booking.eventId?.time || 'TBD'}`, 20, 95);
      doc.text(`Venue: ${booking.eventId?.venue || 'TBD'}`, 20, 110);
      doc.text(`Ticket ID: ${booking._id}`, 20, 130);
      doc.text(`Amount: ₹${booking.amount}`, 20, 145);
      doc.text(`Booked on: ${new Date(booking.bookingDate).toLocaleDateString()}`, 20, 160);
      
      if (qrCode) {
        doc.addImage(qrCode, 'PNG', 140, 70, 50, 50);
      }
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Please present this ticket at the venue entrance', 20, 270);
      doc.text('Thank you for choosing EventHub!', 20, 280);
      
      doc.save(`ticket-${booking.eventId?.title || 'event'}.pdf`);
      toast.success('PDF Ticket Downloaded!');
    } catch (error) {
      console.error('PDF Error:', error);
      toast.error('PDF failed. Use PNG button instead.');
    }
  };

  const cancelBooking = async (bookingId, eventTitle, eventDate, amount) => {
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDateObj - today) / (1000 * 60 * 60 * 24));
    
    let refundMessage = '';
    if (daysUntilEvent < 1) {
      refundMessage = '\n\n⚠️ WARNING: Cancelling on event day - NO REFUND will be issued!';
    } else if (daysUntilEvent < 3) {
      refundMessage = `\n\n⚠️ Cancelling ${daysUntilEvent} day(s) before event - 50% refund only. Refund amount: ₹${amount * 0.5}`;
    } else {
      refundMessage = `\n\n✓ Full refund of ₹${amount} will be issued.`;
    }
    
    if (window.confirm(`Are you sure you want to cancel your ticket for "${eventTitle}"?${refundMessage}\n\nThis action cannot be undone.`)) {
      setCancelling(bookingId);
      try {
        const token = localStorage.getItem('token');
        const response = await api.put(`/api/bookings/cancel/${bookingId}`, { reason: 'User requested cancellation' });
        toast.success(response.data.message);
        fetchBookings();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to cancel booking');
      } finally {
        setCancelling(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-purple-200">Your event passes and QR codes</p>
        </div>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl text-center py-16">
            <Ticket className="w-20 h-20 mx-auto text-purple-300 mb-4" />
            <p className="text-gray-600 text-lg mb-4">No tickets yet</p>
            <button 
              onClick={() => window.location.href = '/events'}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="relative">
                <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-transform hover:scale-105 ${booking.attendanceStatus === 'cancelled' ? 'opacity-60' : ''}`}>
                  {/* Ticket Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-purple-200 text-xs uppercase tracking-wider">Digital Pass</p>
                        <p className="text-white font-bold text-xl">{booking.eventId?.title}</p>
                      </div>
                      <Ticket className="text-white w-8 h-8 opacity-80" />
                    </div>
                  </div>
                  
                  {/* Ticket Body */}
                  <div className="p-5">
                    <div className="mb-4">
                      {booking.attendanceStatus === 'attended' ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">✓ ATTENDED</span>
                      ) : booking.attendanceStatus === 'cancelled' ? (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">✗ CANCELLED</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">✓ VALID TICKET</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-400">Date</p>
                          <p className="text-sm font-semibold">{new Date(booking.eventId?.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-400">Time</p>
                          <p className="text-sm font-semibold">{booking.eventId?.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-400">Venue</p>
                          <p className="text-sm font-semibold truncate">{booking.eventId?.venue}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-400">Amount</p>
                          <p className="text-sm font-semibold">₹{booking.amount}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-dashed border-gray-200 my-4"></div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Ticket ID</p>
                        <p className="text-xs font-mono text-gray-600 break-all max-w-[150px]">{booking._id}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(booking._id);
                            toast.success('Booking ID copied!');
                          }}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded mt-1 transition"
                        >
                          📋 Copy ID
                        </button>
                        <p className="text-xs text-gray-400 mt-2">Booked on</p>
                        <p className="text-sm text-gray-600">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                      </div>
                      
                      {booking.qrCode && booking.attendanceStatus !== 'cancelled' && (
                        <button
                          onClick={() => setShowQR(showQR === booking._id ? null : booking._id)}
                          className="bg-purple-100 p-3 rounded-xl hover:bg-purple-200 transition"
                        >
                          {showQR === booking._id ? <Eye className="w-8 h-8 text-purple-600" /> : <Download className="w-8 h-8 text-purple-600" />}
                        </button>
                      )}
                    </div>
                    
                    {showQR === booking._id && booking.qrCode && booking.attendanceStatus !== 'cancelled' && (
                      <div className="mt-4 pt-4 border-t text-center bg-gray-50 rounded-xl p-4">
                        <img src={booking.qrCode} alt="QR Code" className="w-40 h-40 mx-auto border-2 border-purple-200 rounded-xl p-2 bg-white" />
                        <p className="text-xs text-gray-500 mt-2">Scan this QR code at the venue entrance</p>
                        <div className="flex gap-2 justify-center mt-3">
                          <button onClick={() => downloadPNG(booking.qrCode, booking._id)} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition">Save as PNG</button>
                          <button onClick={() => downloadPDF(booking, booking.qrCode)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition">Download PDF</button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      {booking.attendanceStatus !== 'cancelled' && booking.attendanceStatus !== 'attended' && (
                        <button
                          onClick={() => cancelBooking(booking._id, booking.eventId?.title, booking.eventId?.date, booking.amount)}
                          disabled={cancelling === booking._id}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {cancelling === booking._id ? 'Processing...' : 'Cancel Ticket'}
                        </button>
                      )}
                      
                      {booking.attendanceStatus !== 'cancelled' && (
                        <>
                          <button onClick={() => downloadPNG(booking.qrCode, booking._id)} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition">PNG</button>
                          <button onClick={() => downloadPDF(booking, booking.qrCode)} className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition">PDF Ticket</button>
                        </>
                      )}
                    </div>
                    
                    {booking.attendanceStatus === 'cancelled' && booking.refundAmount > 0 && (
                      <div className="mt-3 p-2 bg-orange-50 rounded-lg text-center">
                        <p className="text-xs text-orange-600">💰 Refund of ₹{booking.refundAmount} processed</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 px-5 py-3 rounded-b-2xl">
                    <p className="text-center text-xs text-gray-400">Powered by EventHub | Smart Event Management</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;