import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Calendar, LogOut, User, LayoutDashboard, Ticket, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glassmorphism px-6 py-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user ? "/events" : "/login"} className="flex items-center space-x-2 text-2xl font-bold text-white">
          <Calendar className="w-8 h-8" />
          <span>VD‑EventHub</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/events" className="text-white hover:text-gray-200 transition">Events</Link>
          
          {user && (
            <>
              <Link to="/dashboard" className="text-white hover:text-gray-200 transition">
                <LayoutDashboard className="w-5 h-5 inline mr-1" />
                Dashboard
              </Link>
              <Link to="/bookings" className="text-white hover:text-gray-200 transition">
                <Ticket className="w-5 h-5 inline mr-1" />
                My Tickets
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-white hover:text-gray-200 transition">
                  Admin Panel
                </Link>
              )}
            </>
          )}

          <button onClick={toggleTheme} className="text-white hover:text-gray-200 transition p-1">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-white">
                <User className="w-4 h-4 inline mr-1" />
                {user.name}
              </span>
              <button onClick={handleLogout} className="text-white hover:text-gray-200">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-x-3">
              <Link to="/login" className="text-white hover:text-gray-200">Login</Link>
              <Link to="/register" className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;