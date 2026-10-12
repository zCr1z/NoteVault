const express = require('express');
const router = express.Router();
const { requireJWT } = require('../middleware/auth');

let Note;
try { Note = require('../models/Note'); } catch {}

// In-memory notes fallback
const inMemoryNotes = [];
let nextId = 1;

function mongoose_connected() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

// Task 5: GET all notes for user (Task 8: with cache)
router.get('/', requireJWT, async (req, res) => {
  try {
    const { cache } = require('../server');
    const cacheKey = `notes_${req.userId}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ notes: cached, fromCache: true });

    let notes;
    if (Note && mongoose_connected()) {
      notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    } else {
      notes = inMemoryNotes.filter(n => n.userId === req.userId);
    }

    cache.set(cacheKey, notes);
    res.json({ notes, fromCache: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Task 5: GET single note
router.get('/:id', requireJWT, async (req, res) => {
  try {
    let note;
    if (Note && mongoose_connected()) {
      note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    } else {
      note = inMemoryNotes.find(n => n.id == req.params.id && n.userId === req.userId);
    }
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Task 5: CREATE note
router.post('/', requireJWT, async (req, res) => {
  const { title, content, subject } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    let note;
    if (Note && mongoose_connected()) {
      note = await Note.create({ title, content, subject, userId: req.userId });
    } else {
      note = { id: nextId++, title, content, subject: subject || 'General', userId: req.userId, createdAt: new Date() };
      inMemoryNotes.push(note);
    }

    // Invalidate cache
    const { cache } = require('../server');
    cache.del(`notes_${req.userId}`);

    res.status(201).json({ message: 'Note created successfully', note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Task 5: UPDATE note
router.put('/:id', requireJWT, async (req, res) => {
  const { title, content, subject } = req.body;
  try {
    let note;
    if (Note && mongoose_connected()) {
      note = await Note.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { title, content, subject },
        { new: true, runValidators: true }
      );
    } else {
      const idx = inMemoryNotes.findIndex(n => n.id == req.params.id && n.userId === req.userId);
      if (idx === -1) return res.status(404).json({ error: 'Note not found' });
      inMemoryNotes[idx] = { ...inMemoryNotes[idx], title, content, subject };
      note = inMemoryNotes[idx];
    }

    if (!note) return res.status(404).json({ error: 'Note not found' });

    const { cache } = require('../server');
    cache.del(`notes_${req.userId}`);

    res.json({ message: 'Note updated', note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Task 5: DELETE note
router.delete('/:id', requireJWT, async (req, res) => {
  try {
    if (Note && mongoose_connected()) {
      await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    } else {
      const idx = inMemoryNotes.findIndex(n => n.id == req.params.id && n.userId === req.userId);
      if (idx === -1) return res.status(404).json({ error: 'Note not found' });
      inMemoryNotes.splice(idx, 1);
    }

    const { cache } = require('../server');
    cache.del(`notes_${req.userId}`);

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
