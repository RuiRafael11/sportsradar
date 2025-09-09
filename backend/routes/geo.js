// backend/routes/geo.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const GOOGLE_PLACES_KEY =
  process.env.GOOGLE_PLACES_KEY ||
  process.env.GOOGLE_PLACES_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  '';

if (!GOOGLE_PLACES_KEY) {
  console.warn('⚠️ GOOGLE_PLACES_KEY ausente — /api/geo/* vai falhar.');
}

router.get('/ping', (_req, res) => {
  res.json({
    ok: true,
    hasKey: !!GOOGLE_PLACES_KEY
  });
});

/**
 * GET /api/geo/suggest?q=Porto
 * Devolve [{ placeId, description }]
 */
router.get('/suggest', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json([]);

    const { data } = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input: q,
          key: GOOGLE_PLACES_KEY,
          language: 'pt-PT',
          components: 'country:pt' // restringe a Portugal
        },
        timeout: 10000,
      }
    );

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn('Places Autocomplete status:', data.status, data.error_message);
    }

    const suggestions = (data.predictions || []).map(p => ({
      placeId: p.place_id,
      description: p.description
    }));

    res.json(suggestions);
  } catch (e) {
    console.error('GEO /suggest error:', e.message);
    res.status(400).json({ msg: 'Falha no autocomplete' });
  }
});

/**
 * GET /api/geo/place?placeId=xxxx
 * Devolve { name, lat, lng }
 */
router.get('/place', async (req, res) => {
  try {
    const placeId = String(req.query.placeId || '').trim();
    if (!placeId) return res.status(400).json({ msg: 'placeId em falta' });

    const { data } = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          key: GOOGLE_PLACES_KEY,
          language: 'pt-PT',
          fields: 'name,geometry/location'
        },
        timeout: 10000,
      }
    );

    if (data.status !== 'OK') {
      console.warn('Place Details status:', data.status, data.error_message);
      return res.status(400).json({ msg: 'Falha no Place Details' });
    }

    const r = data.result || {};
    res.json({
      name: r.name || '',
      lat: r.geometry?.location?.lat ?? null,
      lng: r.geometry?.location?.lng ?? null,
    });
  } catch (e) {
    console.error('GEO /place error:', e.message);
    res.status(400).json({ msg: 'Falha no Place Details' });
  }
});

module.exports = router;
