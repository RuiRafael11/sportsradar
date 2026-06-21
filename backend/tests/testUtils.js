process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_with_enough_length';
process.env.JWT_EXPIRES = '1h';
process.env.REQUIRE_PAYMENT_FOR_BOOKINGS = process.env.REQUIRE_PAYMENT_FOR_BOOKINGS || 'false';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createApp } = require('../app');
const User = require('../models/User');

let mongo;

async function connectTestDb() {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await mongoose.connection.db.dropDatabase();
}

async function closeTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
}

async function clearDb() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

function app() {
  return createApp();
}

async function createUser(overrides = {}) {
  const password = overrides.password || 'password123';
  const user = await User.create({
    name: overrides.name || 'Test User',
    email: overrides.email || `user-${Date.now()}@example.com`,
    password: await bcrypt.hash(password, 10),
    termsAcceptedAt: new Date(),
    privacyAcceptedAt: new Date(),
    preferences: { radiusMeters: 5000, sports: [] },
  });

  return { user, password };
}

function tokenFor(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function futureDate(days = 3) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

module.exports = {
  app,
  connectTestDb,
  closeTestDb,
  clearDb,
  createUser,
  tokenFor,
  futureDate,
};
