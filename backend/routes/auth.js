console.log('🔐 Rotas de auth carregadas');

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User    = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET  = process.env.JWT_SECRET  || 'segredo123';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1h';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Demasiadas tentativas. Tenta novamente mais tarde.' }
});
router.use(authLimiter);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: 'Campos obrigatórios em falta' });

    email = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Utilizador já existe' });

    if (password.length < 6)
      return res.status(400).json({ msg: 'Password deve ter pelo menos 6 caracteres' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: name.trim(), email, password: hash });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Erro no servidor' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: 'Campos obrigatórios em falta' });

    email = String(email).toLowerCase().trim();

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ msg: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: 'Credenciais inválidas' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Erro no servidor' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const me = await User.findById(req.userId).select('name email createdAt updatedAt');
    if (!me) return res.status(404).json({ msg: 'Utilizador não encontrado' });
    res.json(me);
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

// PATCH /api/auth/me
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = String(req.body.name).trim();

    if (req.body.password) {
      if (String(req.body.password).length < 6)
        return res.status(400).json({ msg: 'Password deve ter pelo menos 6 caracteres' });
      updates.password = await bcrypt.hash(String(req.body.password), 10);
    }

    const updated = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('name email');
    if (!updated) return res.status(404).json({ msg: 'Utilizador não encontrado' });
    res.json({ msg: 'Perfil atualizado', user: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

module.exports = router;
