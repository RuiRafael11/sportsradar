const express = require('express');
const requireAuth = require('../middleware/auth');
const Booking = require('../models/Booking');
const router = express.Router();

// POST /api/bookings
router.post('/', requireAuth, async (req, res) => {
  try {
    const { venueId, date, time } = req.body;
    if (!venueId || !date || !time) return res.status(400).json({ msg: 'Campos em falta' });
    const b = await Booking.create({ user: req.userId, venue: venueId, date, time });
    res.status(201).json(b);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Erro ao criar reserva' });
  }
});

// GET /api/bookings/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const list = await Booking.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('venue', 'name district type');
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Erro ao listar reservas' });
  }
});

module.exports = router;
