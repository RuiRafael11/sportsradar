const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;

  if (!token) return res.status(401).json({ msg: 'Token em falta' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'segredo123');
    req.userId = payload.id;
    next();
  } catch (e) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
};
