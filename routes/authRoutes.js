const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Try to use MongoDB, fallback to in-memory
let User;
try { User = require('../models/User'); } catch {}
const inMemoryUsers = [];

// GET Login
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { title: 'Login' });
});

// GET Register
router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('register', { title: 'Register' });
});

// POST Register - Task 2/6: server-side validation + auth
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Invalid email format');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  if (password !== confirmPassword) errors.push('Passwords do not match');

  if (errors.length > 0) {
    return res.render('register', { title: 'Register', errors, formData: req.body });
  }

  try {
    if (User && mongoose_connected()) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.render('register', { title: 'Register', errors: ['Email already registered'], formData: req.body });
      }
      const user = await User.create({ name, email, password });
      req.session.user = { id: user._id, name: user.name, email: user.email };
    } else {
      // In-memory fallback
      if (inMemoryUsers.find(u => u.email === email)) {
        return res.render('register', { title: 'Register', errors: ['Email already registered'], formData: req.body });
      }
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = { id: Date.now().toString(), name, email, password: hashedPassword };
      inMemoryUsers.push(newUser);
      req.session.user = { id: newUser.id, name, email };
    }

    const token = jwt.sign({ id: req.session.user.id }, JWT_SECRET, { expiresIn: '1h' });
    req.session.token = token;
    req.flash('success', `Welcome, ${name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    res.render('register', { title: 'Register', errors: [err.message], formData: req.body });
  }
});

// POST Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');
  if (errors.length > 0) return res.render('login', { title: 'Login', errors, formData: req.body });

  try {
    const bcrypt = require('bcryptjs');
    let user = null;

    if (User && mongoose_connected()) {
      user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.render('login', { title: 'Login', errors: ['Invalid email or password'], formData: req.body });
      }
      req.session.user = { id: user._id, name: user.name, email: user.email };
    } else {
      user = inMemoryUsers.find(u => u.email === email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { title: 'Login', errors: ['Invalid email or password'], formData: req.body });
      }
      req.session.user = { id: user.id, name: user.name, email: user.email };
    }

    const token = jwt.sign({ id: req.session.user.id }, JWT_SECRET, { expiresIn: '1h' });
    req.session.token = token;
    req.flash('success', `Welcome back, ${req.session.user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    res.render('login', { title: 'Login', errors: [err.message], formData: req.body });
  }
});

// Token endpoint for dashboard JS to fetch JWT
router.get('/token', (req, res) => {
  if (!req.session.token) return res.status(401).json({ error: 'Not logged in' });
  res.json({ token: req.session.token });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

function mongoose_connected() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

module.exports = router;
