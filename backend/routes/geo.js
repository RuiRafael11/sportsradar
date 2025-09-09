// backend/routes/geo.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY || process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_KEY) {
  console.warn('⚠️ GOOGLE_PLACES_KEY / GOOGLE_MAPS_API_KEY não definida no .env');
}

// sugestões de cidades em PT
router.get('/suggest', async (req, res) => {
  try {
    const input = String(req.query.q || '').trim();
    if (!input) return res.json([]);

    const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const { data } = await axios.get(url, {
      params: {
        input,
        // restringe a Portugal
        components: 'country:pt',
        // cidades/localidades; (a “types=(cities)” funciona no Autocomplete clássico)
        types: '(cities)',
        key: GOOGLE_KEY,
      },
    });

    const items = (data?.predictions || []).map(p => ({
      placeId: p.place_id,
      description: p.description, // "Porto, Portugal"
    }));

    res.json(items);
  } catch (e) {
    console.error('GEO /suggest error:', e.message);
    res.status(400).json({ msg: 'Falha a obter sugestões' });
  }
});

// detalhes → coordenadas da cidade escolhida
router.get('/place', async (req, res) => {
  try {
    const placeId = String(req.query.placeId || '');
    if (!placeId) return res.status(400).json({ msg: 'placeId em falta' });

    const url = 'https://maps.googleapis.com/maps/api/place/details/json';
    const { data } = await axios.get(url, {
      params: {
        place_id: placeId,
        fields: 'name,geometry/location,formatted_address',
        key: GOOGLE_KEY,
      },
    });

    const r = data?.result;
    if (!r?.geometry?.location) return res.status(404).json({ msg: 'Local não encontrado' });

    res.json({
      name: r.name,
      address: r.formatted_address,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
    });
  } catch (e) {
    console.error('GEO /place error:', e.message);
    res.status(400).json({ msg: 'Falha a obter detalhes' });
  }
});

module.exports = router;
