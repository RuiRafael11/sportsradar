const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/env');

module.exports = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;

  if (!token) return res.status(401).json({ msg: 'Token em falta' });

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.userId = payload.id;
    next();
  } catch (e) {
    if (e.message && e.message.includes('JWT_SECRET')) {
      return res.status(500).json({ msg: 'JWT_SECRET em falta no servidor' });
    }
    return res.status(401).json({ msg: 'Token inválido' });
  }
};

