function getEnv(name, options = {}) {
  const value = process.env[name];
  if (options.required && !value) {
    throw new Error(`${name} is required`);
  }
  return value || options.defaultValue;
}

function getJwtSecret() {
  return getEnv('JWT_SECRET', { required: true });
}

function getCorsOrigins() {
  const raw = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || '';
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function validateServerEnv() {
  getEnv('MONGODB_URI', { required: true });
  getJwtSecret();
}

module.exports = {
  getEnv,
  getJwtSecret,
  getCorsOrigins,
  validateServerEnv,
};
