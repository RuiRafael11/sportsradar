const request = require('supertest');
const Booking = require('../models/Booking');
const {
  app,
  connectTestDb,
  closeTestDb,
  clearDb,
  createUser,
  tokenFor,
  futureDate,
} = require('./testUtils');

beforeAll(connectTestDb);
afterAll(closeTestDb);
beforeEach(clearDb);

describe('booking routes', () => {
  test('create booking for a Google Places venue', async () => {
    const { user } = await createUser();
    const token = tokenFor(user);

    const res = await request(app())
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        venueId: 'g:place_123',
        venueName: 'Court One',
        date: futureDate(),
        time: '10:00',
        amount: 1200,
        currency: 'eur',
      });

    expect(res.status).toBe(201);
    expect(res.body.venueId).toBe('g:place_123');
    expect(res.body.status).toBe('confirmed');
  });

  test('prevent duplicate confirmed booking', async () => {
    const { user } = await createUser();
    const token = tokenFor(user);
    const payload = {
      venueId: 'g:place_123',
      venueName: 'Court One',
      date: futureDate(),
      time: '10:00',
      amount: 1200,
      currency: 'eur',
    };

    await request(app()).post('/api/bookings').set('Authorization', `Bearer ${token}`).send(payload).expect(201);
    const duplicate = await request(app()).post('/api/bookings').set('Authorization', `Bearer ${token}`).send(payload);

    expect(duplicate.status).toBe(409);
  });

  test('list my bookings', async () => {
    const { user } = await createUser();
    const token = tokenFor(user);

    await Booking.create({
      user: user._id,
      venueId: 'g:place_123',
      venueName: 'Court One',
      date: futureDate(),
      time: '11:00',
      status: 'confirmed',
      amount: 1200,
      currency: 'eur',
    });

    const res = await request(app())
      .get('/api/bookings/my')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].venueName).toBe('Court One');
  });

  test('cancel booking', async () => {
    const { user } = await createUser();
    const token = tokenFor(user);
    const booking = await Booking.create({
      user: user._id,
      venueId: 'g:place_123',
      venueName: 'Court One',
      date: futureDate(3),
      time: '12:00',
      status: 'confirmed',
      amount: 1200,
      currency: 'eur',
    });

    const res = await request(app())
      .delete(`/api/bookings/${booking._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe('cancelled');
  });

  test('cannot cancel other user booking', async () => {
    const { user: owner } = await createUser({ email: 'owner@example.com' });
    const { user: other } = await createUser({ email: 'other@example.com' });
    const token = tokenFor(other);
    const booking = await Booking.create({
      user: owner._id,
      venueId: 'g:place_123',
      venueName: 'Court One',
      date: futureDate(3),
      time: '13:00',
      status: 'confirmed',
      amount: 1200,
      currency: 'eur',
    });

    const res = await request(app())
      .delete(`/api/bookings/${booking._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
