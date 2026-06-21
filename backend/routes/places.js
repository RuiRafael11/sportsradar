// backend/routes/places.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Aceita vários nomes de env para evitar confusões
const GOOGLE_PLACES_KEY =
  process.env.GOOGLE_PLACES_KEY ||
  process.env.GOOGLE_PLACES_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  '';
let warnedPlacesDenied = false;

router.get('/ping', (req, res) => {
  res.json({
    ok: true,
    hasKey: Boolean(GOOGLE_PLACES_KEY),
    keyName:
      (process.env.GOOGLE_PLACES_KEY && 'GOOGLE_PLACES_KEY') ||
      (process.env.GOOGLE_PLACES_API_KEY && 'GOOGLE_PLACES_API_KEY') ||
      (process.env.GOOGLE_API_KEY && 'GOOGLE_API_KEY') ||
      null,
  });
});

router.get('/search', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius || 5000);
    const keywordsCsv = String(
      req.query.keywords || 'padel,futebol,futsal,tenis,polidesportivo'
    );
    const keywords = keywordsCsv.split(',').map(s => s.trim()).filter(Boolean);

    if (!GOOGLE_PLACES_KEY) {
      return res.status(500).json({ msg: 'GOOGLE_PLACES_KEY em falta no servidor' });
    }
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ msg: 'lat/lng inválidos' });
    }

    const base = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

    const fetchByKeyword = async (kw) => {
      try {
        const { data } = await axios.get(base, {
          params: {
            location: `${lat},${lng}`,
            radius,
            keyword: kw,
            key: GOOGLE_PLACES_KEY,
            language: 'pt-PT',
            region: 'pt',
          },
          timeout: 10000,
        });

        return {
          keyword: kw,
          status: data.status,
          errorMessage: data.error_message || '',
          results: Array.isArray(data.results) ? data.results : [],
        };
      } catch (err) {
        return {
          keyword: kw,
          status: 'REQUEST_FAILED',
          errorMessage: err.message,
          results: [],
        };
      }
    };

    const responses = await Promise.all(keywords.map(fetchByKeyword));
    const denied = responses.find((item) => item.status === 'REQUEST_DENIED');
    if (denied) {
      if (!warnedPlacesDenied) {
        warnedPlacesDenied = true;
        console.warn(
          `Google Places unavailable: API key is not authorized for Nearby Search (${denied.errorMessage || 'REQUEST_DENIED'}).`
        );
      }
      return res.json([]);
    }

    const unexpected = responses.find(
      (item) => item.status !== 'OK' && item.status !== 'ZERO_RESULTS'
    );
    if (unexpected) {
      console.warn(
        `Google Places warning: ${unexpected.status} for "${unexpected.keyword}" (${unexpected.errorMessage || 'no details'}).`
      );
    }

    const merged = responses.flatMap((item) => item.results);

    // de-dup por place_id
    const map = new Map();
    merged.forEach((it) => {
      if (it && it.place_id && !map.has(it.place_id)) {
        map.set(it.place_id, it);
      }
    });

    // mapeia para o formato do cliente
    const results = Array.from(map.values()).map((it) => ({
      _id: `g:${it.place_id}`,
      name: it.name,
      type: (it.types || [])[0] || '',
      district: it.vicinity || '',
      address: it.vicinity || '',
      lat: it.geometry?.location?.lat,
      lng: it.geometry?.location?.lng,
      rating: it.rating || null,
      userRatingsTotal: it.user_ratings_total || null,
      openNow: it.opening_hours?.open_now ?? null,
      imageUrl: null, // podes depois trocar por Place Photos
    }));

    res.json(results);
  } catch (e) {
    console.error('PLACES_SEARCH ERROR:', e?.response?.data || e.message);
    res.status(400).json({ msg: 'Falha ao consultar Google Places' });
  }
});

module.exports = router;
