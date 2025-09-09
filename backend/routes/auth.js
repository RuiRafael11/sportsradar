console.log('🔐 Rotas de auth carregadas');

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User    = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET  = process.env.JWT_SECRET  || 'segredo123';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1d';

// ─────────────────────────────────────────────────────────────
// Rate-limit APENAS para register/login (não afecta /me)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: 'Demasiadas tentativas. Tenta novamente mais tarde.' }
});
// ─────────────────────────────────────────────────────────────

const normalizeEmail = (e='') => String(e).toLowerCase().trim();
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    let { name, email, password, acceptedTerms, acceptedPrivacy } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ msg: 'Campos obrigatórios em falta' });

    // ⚠️ aceitação obrigatória
    if (!acceptedTerms || !acceptedPrivacy) {
      return res.status(400).json({ msg: 'Tens de aceitar os Termos e a Política de Privacidade.' });
    }

    email = normalizeEmail(email);
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Utilizador já existe' });

    if (String(password).length < 6)
      return res.status(400).json({ msg: 'Password deve ter pelo menos 6 caracteres' });

    const hash = await bcrypt.hash(password, 10);
    const now = new Date();

    const user = await User.create({
      name: String(name).trim(),
      email,
      password: hash,
      preferences: { radiusMeters: 5000, sports: [], homeLocation: undefined },
      termsAcceptedAt: now,
      privacyAcceptedAt: now,
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        expoPushToken: user.expoPushToken || null,
        preferences: user.preferences || { radiusMeters: 5000, sports: [] },
        termsAcceptedAt: user.termsAcceptedAt,
        privacyAcceptedAt: user.privacyAcceptedAt,
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Erro no servidor' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    let { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ msg: 'Campos obrigatórios em falta' });

    email = normalizeEmail(email);

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ msg: 'Credenciais inválidas' });

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(400).json({ msg: 'Credenciais inválidas' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        expoPushToken: user.expoPushToken || null,
        preferences: user.preferences || { radiusMeters: 5000, sports: [] },
        termsAcceptedAt: user.termsAcceptedAt || null,
        privacyAcceptedAt: user.privacyAcceptedAt || null,
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ msg: 'Erro no servidor' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const me = await User.findById(req.userId).select('-password');
    if (!me) return res.status(404).json({ msg: 'Utilizador não encontrado' });
    res.json(me); // inclui termsAcceptedAt / privacyAcceptedAt
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

// PATCH /api/auth/me → atualizar nome/password/expoPushToken/preferences
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const updates = {};

    // nome
    if (req.body.name) updates.name = String(req.body.name).trim();

    // password
    if (req.body.password) {
      const pwd = String(req.body.password);
      if (pwd.length < 6)
        return res.status(400).json({ msg: 'Password deve ter pelo menos 6 caracteres' });
      updates.password = await bcrypt.hash(pwd, 10);
    }

    // push token
    if (req.body.pushToken) updates.expoPushToken = String(req.body.pushToken);
    if (req.body.expoPushToken) updates.expoPushToken = String(req.body.expoPushToken);

    // preferências
    if (req.body.preferences && typeof req.body.preferences === 'object') {
      const p = req.body.preferences;
      const nextPref = {};

      if (p.radiusMeters != null) {
        const r = Number(p.radiusMeters);
        if (Number.isNaN(r)) return res.status(400).json({ msg: 'radiusMeters inválido' });
        nextPref.radiusMeters = clamp(r, 1000, 30000);
      }

      if (Array.isArray(p.sports)) {
        nextPref.sports = p.sports.map(s => String(s).trim().toLowerCase()).filter(Boolean);
      }

      if (p.homeLocation && typeof p.homeLocation === 'object') {
        const lat = Number(p.homeLocation.lat);
        const lng = Number(p.homeLocation.lng);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          nextPref.homeLocation = { lat, lng };
        }
      }

      updates.preferences = nextPref;
    }

    // ⚠️ Não permitimos atualizar terms/privacy aqui para não contornar o fluxo de registo.

    const updated = await User.findByIdAndUpdate(req.userId, updates, { new: true })
      .select('-password');
    if (!updated) return res.status(404).json({ msg: 'Utilizador não encontrado' });

    res.json({ msg: 'Perfil atualizado', user: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Erro no servidor' });
  }
});

module.exports = router;
