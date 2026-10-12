const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// Home page
router.get('/', (req, res) => {
  res.render('index', { title: 'Student Notes App - Home' });
});

// Dashboard (protected)
router.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { title: 'My Notes Dashboard' });
});

// Contact page (Task 1 - form submission)
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});

// Task 2: Handle contact form with server-side validation
router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push('Name must be at least 2 characters');
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    errors.push('Please enter a valid email');
  if (!message || message.trim().length < 10)
    errors.push('Message must be at least 10 characters');

  if (errors.length > 0) {
    return res.render('contact', {
      title: 'Contact Us',
      errors,
      formData: req.body
    });
  }

  // Task 2: store in temporary server-side storage
  if (!global.contactSubmissions) global.contactSubmissions = [];
  global.contactSubmissions.push({ name, email, message, date: new Date() });

  req.flash('success', 'Message sent successfully!');
  res.redirect('/contact');
});

module.exports = router;
