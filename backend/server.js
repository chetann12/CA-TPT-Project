require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { csrfSync } = require('csrf-sync');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['X-CSRF-Token']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

const {
  csrfSynchronisedProtection,
  generateToken,
} = csrfSync({
  // Exclude auth routes that don't need CSRF protection
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => {
    return req.headers['x-csrf-token'] || req.body.csrfToken;
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
});
app.use(limiter);

// Route for frontend to get a CSRF token
app.get('/api/csrf-token', (req, res, next) => {
  try {
    const csrfToken = generateToken(req);
    console.log('Generated CSRF Token:', csrfToken);
    res.json({ csrfToken });
  } catch (err) {
    console.error('Error generating CSRF token:', err);
    next(err);
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/client-portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth routes WITHOUT CSRF protection (for login, register, etc.)
app.use('/api/auth', require('./routes/auth'));

// Apply CSRF protection to all other routes that need it
app.use('/api/documents', csrfSynchronisedProtection, require('./routes/documents'));
app.use('/api/profile', csrfSynchronisedProtection, require('./routes/profile'));
app.use('/api/billing', csrfSynchronisedProtection, require('./routes/billing'));
app.use('/api/admin', csrfSynchronisedProtection, require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Full error object:', err);
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ message: 'CSRF token validation failed' });
    return;
  }
  console.error('Custom error handler:', err);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});