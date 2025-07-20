const express = require('express');
const Note = require('../models/Note');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new note
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = new Note({
      user: req.user.id,
      title,
      content,
    });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all notes for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single note by ID (optional)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a note by ID
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content, updatedAt: Date.now() },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found or not authorized' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a note by ID
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found or not authorized' });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const { improveNote } = require('../controllers/geminiController');

router.post('/improve', authMiddleware, improveNote);


module.exports = router;
