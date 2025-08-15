const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
console.log('🔐 Rotas de auth carregadas');

const router = express.Router();

// 📌 Registo
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Verifica se já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'Utilizador já existe' });
    }

    // Cria novo utilizador
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });

    await user.save();

    // Cria token
    const token = jwt.sign({ id: user._id }, 'segredo123', { expiresIn: '1h' });
    res.json({ token });

  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
});

// 📌 Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user._id }, 'segredo123', { expiresIn: '1h' });
    res.json({ token });

  } catch (err) {
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
