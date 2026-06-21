require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const geoRouter = require('./routes/geo');
const venuesRouter = require('./routes/venues');
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');
const paymentsRouter = require('./routes/payments');
const placesRouter = require('./routes/places');
const venueExtrasRouter = require('./routes/venueExtras');
const { getCorsOrigins } = require('./config/env');

function createCorsOptions() {
  const allowedOrigins = getCorsOrigins();

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  };
}

function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: '1mb' }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
  });

  app.use('/api/geo', geoRouter);
  app.use('/api/places', placesRouter);
  app.use('/api/venues', venuesRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/venue-extras', venueExtrasRouter);

  app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));
  app.use((err, req, res, _next) => {
    if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({ msg: 'Origin not allowed by CORS' });
    }

    if (process.env.NODE_ENV !== 'test') {
      console.error('Unhandled error:', err);
    }

    return res.status(err.status || 500).json({
      msg: err.expose ? err.message : err.message || 'Server error',
    });
  });

  return app;
}

module.exports = { createApp };
