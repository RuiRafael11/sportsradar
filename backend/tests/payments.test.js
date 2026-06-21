jest.mock('../services/stripeClient', () => ({
  getStripeClient: jest.fn(),
}));

const request = require('supertest');
const { getStripeClient } = require('../services/stripeClient');
const {
  app,
  connectTestDb,
  closeTestDb,
  clearDb,
  createUser,
  tokenFor,
} = require('./testUtils');

beforeAll(connectTestDb);
afterAll(closeTestDb);
beforeEach(async () => {
  await clearDb();
  getStripeClient.mockReset();
});

describe('payment routes', () => {
  test('create payment sheet with mocked Stripe client', async () => {
    getStripeClient.mockReturnValue({
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_test' }),
      },
      ephemeralKeys: {
        create: jest.fn().mockResolvedValue({ secret: 'ek_secret_test' }),
      },
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          id: 'pi_test',
          client_secret: 'pi_secret_test',
        }),
      },
    });

    const { user } = await createUser();
    const token = tokenFor(user);

    const res = await request(app())
      .post('/api/payments/payment-sheet')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 1200, currency: 'eur' });

    expect(res.status).toBe(200);
    expect(res.body.paymentIntent).toBe('pi_secret_test');
    expect(res.body.ephemeralKey).toBe('ek_secret_test');
    expect(res.body.customer).toBe('cus_test');
    expect(res.body.paymentIntentId).toBe('pi_test');
  });
});
