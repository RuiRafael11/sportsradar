// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');

// ===== Stripe client com SECRET do .env =====
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY não definida no .env');
}
const stripe = require('stripe')(STRIPE_SECRET_KEY);

// (opcional) expor a publishable para o cliente preparar PaymentSheet
const PUBLISHABLE_KEY = process.env.PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

/**
 * Healthcheck rápido
 */
router.get('/ping', (req, res) => {
  res.json({
    ok: true,
    hasSecret: Boolean(STRIPE_SECRET_KEY),
    hasPublishable: Boolean(PUBLISHABLE_KEY),
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
    const amount = Number(req.body?.amount ?? 1200); // default 12.00€
    const currency = String(req.body?.currency || 'eur').toLowerCase();
    const customerEmail = req.body?.customerEmail || undefined;

    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ msg: 'Stripe secret key em falta no servidor' });
    }

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
      publishableKey: PUBLISHABLE_KEY, // o cliente pode usar esta se precisar
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
