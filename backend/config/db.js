require('dotenv').config({ quiet: true }); // Load environment variables from .env file (quiet: suppress runtime log)

const mongoose = require('mongoose');

// Application configuration
const config = {
  PORT: process.env.PORT || 4000,
  // Support both MONGO_URL and MONGODB_URI env var names for compatibility
  MONGODB_URI: process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/attendenceDB',
  JWT_SECRET: process.env.JWT_SECRET || 'replace-with-secure-secret',
};

// connectDB is a function that the app can call at startup to connect to MongoDB
const connectDB = async () => {
  try {
    // The MongoDB Node driver v4+ enables the modern parser and topology by default.
    // Passing `useNewUrlParser` and `useUnifiedTopology` is deprecated and has no effect.
    await mongoose.connect(config.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, config };
