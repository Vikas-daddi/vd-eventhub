const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the MONGO_URI from environment variables, fallback to localhost for development
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/event_management';
    console.log('MONGO_URI is set:', !!process.env.MONGO_URI);
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;