const express = require('express');
const router = express.Router();
const VenueExtra = require('../models/VenueExtra');

/**
 * Segurança simples para backoffice/manual:
 * cria no .env -> ADMIN_API_KEY=algum_segredo
 * e envia em 'x-admin-key' nos pedidos de escrita.
 */
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

const assertAdmin = (req, res, next) => {
  if (!ADMIN_API_KEY) return res.status(500).json({ msg: 'ADMIN_API_KEY em falta' });
  if (req.headers['x-admin-key'] !== ADMIN_API_KEY) {
    return res.status(401).json({ msg: 'Admin key inválida' });
  }
  next();
};

// GET /api/venue-extras/:placeId  → devolve os extras (ou vazio)
router.get('/:placeId', async (req, res) => {
  const id = decodeURIComponent(req.params.placeId);
  const doc = await VenueExtra.findOne({ placeId: id }).lean();
  res.json(doc || { placeId: id, details: {} });
});

// POST /api/venue-extras  (admin) → upsert por placeId
router.post('/', assertAdmin, async (req, res) => {
  const { placeId, details = {} } = req.body || {};
  if (!placeId) return res.status(400).json({ msg: 'placeId em falta' });

  const doc = await VenueExtra.findOneAndUpdate(
    { placeId },
    { $set: { details } },
    { new: true, upsert: true }
  ).lean();

  res.status(201).json({ msg: 'Guardado', doc });
});

// POST /api/venue-extras/bulk  → devolve extras para vários ids
router.post('/bulk', async (req, res) => {
  const placeIds = Array.isArray(req.body?.placeIds) ? req.body.placeIds : [];
  if (!placeIds.length) return res.json([]);

  const docs = await VenueExtra.find({ placeId: { $in: placeIds } }).lean();
  res.json(docs);
});

module.exports = router;
