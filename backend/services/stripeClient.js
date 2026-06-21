let stripeClient;

function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    const err = new Error('STRIPE_SECRET_KEY em falta no servidor');
    err.status = 500;
    throw err;
  }

  if (!stripeClient) {
    stripeClient = require('stripe')(secret);
  }

  return stripeClient;
}

function resetStripeClientForTests() {
  stripeClient = null;
}

module.exports = {
  getStripeClient,
  resetStripeClientForTests,
};
