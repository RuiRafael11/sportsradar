// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { getStripeClient } = require('../services/stripeClient');
const { normalizeCurrency, parsePositiveInteger } = require('../utils/validation');

// (opcional) expor a publishable para o cliente preparar PaymentSheet
const getPublishableKey = () =>
  process.env.PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

/**
 * Healthcheck rápido
 */
router.get('/ping', (req, res) => {
  res.json({
    ok: true,
    hasSecret: Boolean(process.env.STRIPE_SECRET_KEY),
    hasPublishable: Boolean(getPublishableKey()),
  });
});

/**
 * Cria dados para o PaymentSheet:
 * - customer (ou reutiliza)
 * - ephemeral key
 * - payment intent
 * body: { amount (em cêntimos), currency, customerEmail? }
 */
router.post('/payment-sheet', requireAuth, async (req, res) => {
  try {
    const amount = parsePositiveInteger(req.body?.amount ?? 1200);
    const currency = normalizeCurrency(req.body?.currency || 'eur');
    const customerEmail = req.body?.customerEmail || undefined;

    if (!amount || !currency) {
      return res.status(400).json({ msg: 'amount/currency inválidos' });
    }

    const stripe = getStripeClient();

    // 1) Customer (podes persistir o customerId no teu User se quiseres)
    const customer = await stripe.customers.create(
      customerEmail ? { email: customerEmail } : {}
    );

    // 2) Ephemeral key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-06-20' } // usa uma versão recente
    );

    // 3) PaymentIntent (automático para cartões, Apple/Google Pay, etc.)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });

    return res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: getPublishableKey(), // o cliente pode usar esta se precisar
      paymentIntentId: paymentIntent.id,
    });
  } catch (e) {
    console.error('PAYMENT_SHEET ERROR:', e);
    const msg = e?.raw?.message || e?.message || 'Erro a preparar pagamento';
    return res.status(400).json({ msg });
  }
});

/**
 * (Opcional) Captura/Confirmação server-side ou obter recibo:
 * Recebe paymentIntentId e devolve latest_charge e receipt_url
 */
router.post('/capture', requireAuth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body || {};
    if (!paymentIntentId) {
      return res.status(400).json({ msg: 'paymentIntentId em falta' });
    }

    const stripe = getStripeClient();

    // Obter o PI para ler latest_charge (no modo automático já vai “requires_capture: false”)
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    });

    const charge = pi.latest_charge;
    const receiptUrl = charge?.receipt_url || null;

    return res.json({
      paymentIntentId: pi.id,
      status: pi.status,
      receiptUrl,
      chargeId: charge?.id || null,
    });
  } catch (e) {
    console.error('PAYMENTS_CAPTURE ERROR:', e);
    const msg = e?.raw?.message || e?.message || 'Erro ao capturar/obter recibo';
    return res.status(400).json({ msg });
  }
});

module.exports = router;
