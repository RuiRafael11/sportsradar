// backend/routes/payments.js
const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

router.get('/ping', (req, res) => {
  res.json({
    ok: true,
    hasSecret: !!STRIPE_SECRET_KEY,
    message: STRIPE_SECRET_KEY ? 'Stripe key presente' : '⚠️ STRIPE_SECRET_KEY ausente no .env',
  });
});

// POST /api/payments/payment-sheet
router.post('/payment-sheet', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(400).json({ error: { message: 'STRIPE_SECRET_KEY não configurada no backend' } });
    }

    const amount = Number(req.body?.amount);
    const currency = String(req.body?.currency || 'eur').toLowerCase();

    if (!Number.isFinite(amount) || amount < 50) {
      return res.status(400).json({ error: { message: 'amount inválido (mínimo 50 cêntimos)' } });
    }

    console.log('💳 /payment-sheet body =>', req.body);

    // cliente (demo)
    const customers = await stripe.customers.list({ limit: 1 });
    const customerId = customers.data[0]?.id || (await stripe.customers.create({ name: 'SportRadar User' })).id;

    // ephemeral key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2024-06-20' } // mantém esta versão
    );

    // payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      automatic_payment_methods: { enabled: true },
    });

    return res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
    });
  } catch (err) {
    console.error('❌ Stripe error:', err?.type, err?.code, err?.message);
    return res.status(400).json({ error: { message: err?.message || 'Erro Stripe' } });
  }
});

module.exports = router;
