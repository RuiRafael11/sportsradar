// backend/index.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const morgan   = require('morgan');

const geoRouter         = require('./routes/geo');
const venuesRouter      = require('./routes/venues');       // 📌 Venues (internos)
const authRouter        = require('./routes/auth');         // 🔐 Auth
const bookingsRouter    = require('./routes/bookings');     // 🗓️ Reservas
const paymentsRouter    = require('./routes/payments');     // 💳 Stripe
const placesRouter      = require('./routes/places');       // 🌍 Proxy Google Places
const venueExtrasRouter = require('./routes/venueExtras');  // 🧩 Detalhes extra (g:<place_id>)

const app = express();

// ---- Middlewares base
app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// ---- Health checks
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, env: process.env.NODE_ENV || 'dev' })
);
app.get('/api/payments/ping', (_req, res) =>
  res.json({
    ok: true,
    hasSecret: !!process.env.STRIPE_SECRET_KEY,
    message: process.env.STRIPE_SECRET_KEY
      ? 'Stripe key presente'
      : '⚠️ STRIPE_SECRET_KEY ausente no .env',
  })
);

// ---- Rotas
app.use('/api/geo',          geoRouter);
app.use('/api/places',       placesRouter);
app.use('/api/venues',       venuesRouter);
app.use('/api/auth',         authRouter);
app.use('/api/bookings',     bookingsRouter);
app.use('/api/payments',     paymentsRouter);
app.use('/api/venue-extras', venueExtrasRouter);

// ---- 404 & error handler
app.use((req, res) => res.status(404).json({ msg: 'Rota não encontrada' }));
app.use((err, req, res, _next) => {
  console.error('❌ Unhandled error:', err);
  res.status(err.status || 500).json({ msg: err.message || 'Erro no servidor' });
});

// ---- ENV / Mongo URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI não definida. Tens o .env na pasta backend?');
  process.exit(1);
}
const masked = MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+/, '$1*****');
console.log('🔎 URI (mascarada):', masked);

// ---- Liga à BD e arranca servidor
const PORT = process.env.PORT || 5000;
mongoose.set('strictQuery', true);
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Ligado ao MongoDB');
    app.listen(PORT, () => console.log(`🚀 Servidor a correr na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Erro ao ligar ao MongoDB:', err.message);
    process.exit(1);
  });
