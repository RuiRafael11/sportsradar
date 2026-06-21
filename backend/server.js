require('dotenv').config();

const mongoose = require('mongoose');
const { createApp } = require('./app');
const { validateServerEnv } = require('./config/env');

async function start() {
  validateServerEnv();

  const port = process.env.PORT || 5000;
  const mongoUri = process.env.MONGODB_URI;
  const masked = mongoUri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+/, '$1*****');

  mongoose.set('strictQuery', true);
  console.log('MongoDB URI:', masked);

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const app = createApp();
  return app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
}

module.exports = { start };
