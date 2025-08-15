
console.log("📌 Rota de venues carregada!");
const express = require('express');
const Venue = require('../models/Venue');

const router = express.Router();

// GET /api/venues
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: 'Erro a obter venues' });
  }
});

module.exports = router;
