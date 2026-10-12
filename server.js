require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // Task 8: server-side caching

// ─── TASK 8: Middleware ───────────────────────────────────────────────────────
app.use(morgan('dev')); // logging middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// ─── TASK 8: Rate Limiting ────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ─── Session & Flash ──────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'cognifyz_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));
app.use(flash());

// Make flash + user available in all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// ─── Task 1: Server-side rendering with EJS ──────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', './views');

// ─── Task 6: MongoDB Connection ───────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cognifyz_notes';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(() => {
    console.log('⚠️  MongoDB not found — running in memory mode');
  });

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/', require('./routes/pageRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = { app, cache };
