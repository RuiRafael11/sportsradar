// backend/scripts/seedRandomExtras.js
require('dotenv').config();
const axios    = require('axios');
const mongoose = require('mongoose');
const VenueExtra = require('../models/VenueExtra');

const MONGODB_URI = process.env.MONGODB_URI;
const GOOGLE_PLACES_KEY =
  process.env.GOOGLE_PLACES_KEY ||
  process.env.GOOGLE_PLACES_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  '';

const TARGET_TOTAL = Number(process.env.SEED_TARGET || 200);

// cidades alvo
const CITIES = [
  { name: 'Porto',      lat: 41.1579, lng: -8.6291, radius: 50000 },
  { name: 'Vila Real',  lat: 41.3006, lng: -7.7441, radius: 45000 },
  { name: 'Bragança',   lat: 41.8060, lng: -6.7567, radius: 45000 },
];

// keywords desportivas
const KEYWORDS = ['padel','tenis','futsal','basquetebol','futebol','polidesportivo','pavilhao','multiusos','atletismo'];

const rndBool = (p=0.5) => Math.random() < p;
const rndPick = (arr) => arr[Math.floor(Math.random()*arr.length)];
const rnd = (min,max) => Math.floor(Math.random()*(max-min+1))+min;

async function searchNearby(lat,lng,radius,keyword) {
  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  const { data } = await axios.get(url, {
    params: { location: `${lat},${lng}`, radius, keyword, key: GOOGLE_PLACES_KEY, language:'pt-PT', region:'pt' },
    timeout: 12000,
  });
  return Array.isArray(data.results) ? data.results : [];
}

function fakeDetails() {
  const surfaces = ['madeira','betão','relva sintética','terra batida','vinil','acrílico'];
  const price = rnd(5, 25) * 1; // €5..€25
  return {
    hasLockerRoom:   rndBool(0.6),
    hasShowers:      rndBool(0.55),
    hasLighting:     rndBool(0.7),
    covered:         rndBool(0.35),
    indoor:          rndBool(0.45),
    parking:         rndBool(0.5),
    equipmentRental: rndBool(0.4),

    surface:         rndPick(surfaces),
    lengthMeters:    rnd(18, 110),
    widthMeters:     rnd(9, 70),

    pricePerHour:    price,
    currency:        'EUR',

    openingHours:    'Seg–Dom 08:00–23:00',
    contact: {
      phone:   `+351 9${rnd(10,99)} ${rnd(100,999)} ${rnd(100,999)}`,
      email:   `contacto${rnd(10,999)}@exemplo.pt`,
      website: '',
    },
  };
}

(async () => {
  console.log('🚀 Seed random extras – TARGET =', TARGET_TOTAL);
  if (!MONGODB_URI) { console.error('MONGODB_URI em falta'); process.exit(1); }
  if (!GOOGLE_PLACES_KEY) { console.error('GOOGLE_PLACES_KEY em falta'); process.exit(1); }

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Mongo ligado');

  // junta place_ids de várias cidades
  const bag = new Map(); // place_id -> true
  for (const city of CITIES) {
    for (const kw of KEYWORDS) {
      try {
        const res = await searchNearby(city.lat, city.lng, city.radius, kw);
        res.forEach(r => r?.place_id && bag.set(r.place_id, true));
        console.log(`📍 ${city.name} / ${kw}: total provisório = ${bag.size}`);
        if (bag.size >= TARGET_TOTAL * 1.3) break; // chega
      } catch(e) {
        console.warn('Falhou', city.name, kw, e.message);
      }
    }
  }

  const allIds = Array.from(bag.keys()).slice(0, TARGET_TOTAL);
  console.log('🧾 PlaceIds prontos:', allIds.length);

  let done = 0;
  for (const pid of allIds) {
    const placeId = `g:${pid}`;
    await VenueExtra.findOneAndUpdate(
      { placeId },
      { $set: { details: fakeDetails() } },
      { upsert: true, new: true }
    );
    done++;
    if (done % 20 === 0) console.log(`  … ${done}/${allIds.length}`);
  }

  console.log(`✅ Seed concluído: ${done} documentos em venueextras.`);
  process.exit(0);
})();
