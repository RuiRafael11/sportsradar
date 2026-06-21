const request = require('supertest');
const {
  app,
  connectTestDb,
  closeTestDb,
  clearDb,
} = require('./testUtils');

beforeAll(connectTestDb);
afterAll(closeTestDb);
beforeEach(clearDb);

describe('auth routes', () => {
  test('register success', async () => {
    const res = await request(app())
      .post('/api/auth/register')
      .send({
        name: 'Rui',
        email: 'rui@example.com',
        password: 'password123',
        acceptedTerms: true,
        acceptedPrivacy: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('rui@example.com');
    expect(res.body.user.password).toBeUndefined();
  });

  test('duplicate email', async () => {
    const payload = {
      name: 'Rui',
      email: 'rui@example.com',
      password: 'password123',
      acceptedTerms: true,
      acceptedPrivacy: true,
    };

    await request(app()).post('/api/auth/register').send(payload).expect(201);
    const res = await request(app()).post('/api/auth/register').send(payload);

    expect(res.status).toBe(400);
  });

  test('login success', async () => {
    await request(app())
      .post('/api/auth/register')
      .send({
        name: 'Rui',
        email: 'rui@example.com',
        password: 'password123',
        acceptedTerms: true,
        acceptedPrivacy: true,
      })
      .expect(201);

    const res = await request(app())
      .post('/api/auth/login')
      .send({ email: 'rui@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.password).toBeUndefined();
  });

  test('invalid login', async () => {
    const res = await request(app())
      .post('/api/auth/login')
      .send({ email: 'missing@example.com', password: 'wrong' });

    expect(res.status).toBe(400);
  });

  test('/me with valid token', async () => {
    const registered = await request(app())
      .post('/api/auth/register')
      .send({
        name: 'Rui',
        email: 'rui@example.com',
        password: 'password123',
        acceptedTerms: true,
        acceptedPrivacy: true,
      })
      .expect(201);

    const res = await request(app())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registered.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('rui@example.com');
    expect(res.body.password).toBeUndefined();
  });

  test('/me without token', async () => {
    await request(app()).get('/api/auth/me').expect(401);
  });
});
