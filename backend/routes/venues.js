// backend/routes/venues.js
const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');

// Lista de recintos
router.get('/', async (req, res) => {
  const list = await Venue.find().sort('name').lean();
  res.json(list);
});

// Detalhe por ID
router.get('/:id', async (req, res) => {
  try {
    const v = await Venue.findById(req.params.id).lean();
    if (!v) return res.status(404).json({ msg: 'Recinto não encontrado' });
    res.json(v);
  } catch (e) {
    return res.status(400).json({ msg: 'ID inválido' });
  }
});

module.exports = router;
