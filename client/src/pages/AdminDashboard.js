import React, { useState, useEffect, useRef } from 'react';
import { Users, Calendar, Ticket, DollarSign, TrendingUp, Plus, Trash2, Camera, X, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../services/api'; // ✅ uses environment variable

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalRevenue: 0,
    attendancePercentage: 0
  });
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'Conference',
    venue: '',
    date: '',
    time: '',
    price: '',
    availableSeats: '',
    image: ''
  });

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    date: '',
    time: '',
    price: '',
    availableSeats: '',
    image: ''
  });

  useEffect(() => {
    fetchStats();
    fetchEvents();
    fetchUsers();
    fetchBookings();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load stats');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/events');
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/users');
      const regularUsers = response.data.filter(user => user.role !== 'admin');
      setUsers(regularUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/admin/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/events', newEvent);
      toast.success('Event added successfully!');
      setShowAddEvent(false);
      setNewEvent({
        title: '',
        description: '',
        category: 'Conference',
        venue: '',
        date: '',
        time: '',
        price: '',
        availableSeats: '',
        image: ''
      });
      fetchEvents();
      fetchStats();
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.put(`/api/events/${editingEvent._id}`, editFormData);
      toast.success('Event updated successfully!');
      setShowEditEvent(false);
      setEditingEvent(null);
      fetchEvents();
      fetchStats();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/api/events/${eventId}`);
        toast.success('Event deleted successfully');
        fetchEvents();
        fetchStats();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setEditFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      venue: event.venue,
      date: event.date.split('T')[0],
      time: event.time,
      price: event.price,
      availableSeats: event.availableSeats,
      image: event.image || ''
    });
    setShowEditEvent(true);
  };

  const startScanner = () => {
    setShowScanner(true);
    setTimeout(() => {
      if (document.getElementById('qr-reader')) {
        const html5QrCodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          false
        );
        html5QrCodeScanner.render(onScanSuccess, onScanError);
        scannerRef.current = html5QrCodeScanner;
      }
    }, 500);
  };

  const onScanSuccess = async (decodedText) => {
    if (!scanning) {
      setScanning(true);
      try {
        const token = localStorage.getItem('token');
        await api.post('/api/bookings/scan-qr', { qrData: decodedText });
        toast.success('Attendance marked successfully!');
        closeScanner();
        fetchStats();
        fetchEvents();
        fetchBookings();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to mark attendance');
        setScanning(false);
      }
    }
  };

  const onScanError = (error) => console.log('Scan error:', error);

  const closeScanner = () => {
    if (scannerRef.current) scannerRef.current.clear();
    setShowScanner(false);
    setScanning(false);
  };

  const manualAttendance = async () => {
    const bookingId = prompt('Enter Booking ID to mark attendance:');
    if (bookingId && bookingId.trim()) {
      toast.loading('Checking attendance...');
      try {
        const token = localStorage.getItem('token');
        await api.post('/api/bookings/scan-qr', { qrData: bookingId.trim() });
        toast.dismiss();
        toast.success('✅ Attendance marked successfully!');
        fetchStats();
        fetchEvents();
        fetchBookings();
      } catch (error) {
        toast.dismiss();
        toast.error(error.response?.data?.message || 'Failed to mark attendance');
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button onClick={startScanner} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <Camera className="w-5 h-5" /> Scan QR Code
          </button>
          <button onClick={manualAttendance} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Manual Check-in
          </button>
          <button onClick={() => setShowAddEvent(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center"><Users className="w-8 h-8 mx-auto text-purple-600 mb-2" /><h3 className="text-2xl font-bold">{stats.totalUsers}</h3><p className="text-sm text-gray-600">Total Users</p></div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center"><Calendar className="w-8 h-8 mx-auto text-purple-600 mb-2" /><h3 className="text-2xl font-bold">{stats.totalEvents}</h3><p className="text-sm text-gray-600">Total Events</p></div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center"><Ticket className="w-8 h-8 mx-auto text-purple-600 mb-2" /><h3 className="text-2xl font-bold">{stats.totalBookings}</h3><p className="text-sm text-gray-600">Total Bookings</p></div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center"><DollarSign className="w-8 h-8 mx-auto text-purple-600 mb-2" /><h3 className="text-2xl font-bold">₹{Math.round(stats.totalRevenue)}</h3><p className="text-sm text-gray-600">Total Revenue</p></div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center"><TrendingUp className="w-8 h-8 mx-auto text-purple-600 mb-2" /><h3 className="text-2xl font-bold">{stats.attendancePercentage}%</h3><p className="text-sm text-gray-600">Attendance Rate</p></div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Scan QR Code</h2><button onClick={closeScanner}><X className="w-6 h-6 text-gray-500 hover:text-gray-700" /></button></div>
            <p className="text-gray-600 mb-4">Place the QR code in front of your camera</p>
            <div id="qr-reader" className="w-full"></div>
            <button onClick={closeScanner} className="mt-4 w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600">Close Scanner</button>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Manage Events</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b"><th className="text-left py-3">Title</th><th className="text-left py-3">Category</th><th className="text-left py-3">Date</th><th className="text-left py-3">Price</th><th className="text-left py-3">Seats</th><th className="text-left py-3">Actions</th></tr></thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{event.title}</td>
                  <td className="py-3"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">{event.category}</span></td>
                  <td className="py-3">{new Date(event.date).toLocaleDateString()}</td>
                  <td className="py-3">₹{event.price}</td>
                  <td className="py-3">{event.availableSeats}</td>
                  <td className="py-3 flex gap-2">
                    <button onClick={() => openEditModal(event)} className="text-blue-500 hover:text-blue-700"><Edit3 className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteEvent(event._id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {events.length === 0 && <div className="text-center py-8 text-gray-500">No events yet. Click "Add Event" to create one.</div>}
        </div>
      </div>

      {/* All Bookings Table */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">All Bookings / Tickets</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b"><th className="text-left py-3">User</th><th className="text-left py-3">Event</th><th className="text-left py-3">Amount</th><th className="text-left py-3">Payment</th><th className="text-left py-3">Attendance</th><th className="text-left py-3">Booked On</th><th className="text-left py-3">Ticket ID</th><th>Actions</th></tr></thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking._id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{booking.userId?.name || 'Unknown'}<div className="text-xs text-gray-400">{booking.userId?.email}</div></td>
                  <td className="py-3">{booking.eventId?.title || 'Deleted Event'}</td>
                  <td className="py-3">₹{booking.amount}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{booking.paymentStatus}</span></td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${booking.attendanceStatus === 'attended' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{booking.attendanceStatus}</span></td>
                  <td className="py-3">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                  <td className="py-3 font-mono text-xs">{booking._id.slice(-8)}</td>
                  <td className="py-3"><button onClick={() => navigator.clipboard.writeText(booking._id)} className="text-gray-500 hover:text-purple-600">📋</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <div className="text-center py-8 text-gray-500">No bookings yet.</div>}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Registered Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b"><th className="text-left py-3">Name</th><th className="text-left py-3">Email</th><th className="text-left py-3">Role</th><th className="text-left py-3">Joined</th></tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{user.name}</td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{user.role}</span></td>
                  <td className="py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Event</h2>
            <form onSubmit={handleAddEvent}>
              <input type="text" placeholder="Event Title" className="w-full p-2 border rounded mb-3" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full p-2 border rounded mb-3" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} required />
              <select className="w-full p-2 border rounded mb-3" value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})}>
                <option>Conference</option><option>Workshop</option><option>Concert</option><option>Seminar</option><option>Sports</option><option>Other</option>
              </select>
              <input type="text" placeholder="Venue" className="w-full p-2 border rounded mb-3" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} required />
              <input type="date" className="w-full p-2 border rounded mb-3" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} required />
              <input type="text" placeholder="Time (e.g., 10:00 AM)" className="w-full p-2 border rounded mb-3" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} required />
              <input type="number" placeholder="Price (₹)" className="w-full p-2 border rounded mb-3" value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: e.target.value})} required />
              <input type="number" placeholder="Available Seats" className="w-full p-2 border rounded mb-3" value={newEvent.availableSeats} onChange={e => setNewEvent({...newEvent, availableSeats: e.target.value})} required />
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Image URL (optional)</label>
                <input type="text" placeholder="https://example.com/event-image.jpg" className="w-full p-2 border rounded" value={newEvent.image} onChange={e => setNewEvent({...newEvent, image: e.target.value})} />
                {newEvent.image && <img src={newEvent.image} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded" />}
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700">Add Event</button>
                <button type="button" onClick={() => setShowAddEvent(false)} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditEvent && editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Event</h2>
            <form onSubmit={handleUpdateEvent}>
              <input type="text" placeholder="Event Title" className="w-full p-2 border rounded mb-3" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full p-2 border rounded mb-3" value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} required />
              <select className="w-full p-2 border rounded mb-3" value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})}>
                <option>Conference</option><option>Workshop</option><option>Concert</option><option>Seminar</option><option>Sports</option><option>Other</option>
              </select>
              <input type="text" placeholder="Venue" className="w-full p-2 border rounded mb-3" value={editFormData.venue} onChange={e => setEditFormData({...editFormData, venue: e.target.value})} required />
              <input type="date" className="w-full p-2 border rounded mb-3" value={editFormData.date} onChange={e => setEditFormData({...editFormData, date: e.target.value})} required />
              <input type="text" placeholder="Time (e.g., 10:00 AM)" className="w-full p-2 border rounded mb-3" value={editFormData.time} onChange={e => setEditFormData({...editFormData, time: e.target.value})} required />
              <input type="number" placeholder="Price (₹)" className="w-full p-2 border rounded mb-3" value={editFormData.price} onChange={e => setEditFormData({...editFormData, price: e.target.value})} required />
              <input type="number" placeholder="Available Seats" className="w-full p-2 border rounded mb-3" value={editFormData.availableSeats} onChange={e => setEditFormData({...editFormData, availableSeats: e.target.value})} required />
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Image URL</label>
                <input type="text" placeholder="https://example.com/event-image.jpg" className="w-full p-2 border rounded" value={editFormData.image} onChange={e => setEditFormData({...editFormData, image: e.target.value})} />
                {editFormData.image && <img src={editFormData.image} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded" />}
              </div>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700">Update Event</button>
                <button type="button" onClick={() => setShowEditEvent(false)} className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;