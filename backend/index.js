  require('dotenv').config();
  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');

  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- DEBUG: ver se a ENV está a ser lida ---
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    console.error('❌ MONGODB_URI não definida. Tens o .env na pasta backend?');
    process.exit(1);
  }
  // mascara password só para debug de consola
  const masked = rawUri.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+/, '$1*****');
  console.log('🔎 URI (mascarada):', masked);

  // --- Rotas (carregam já, mas só ouvimos depois da BD ligar) ---
  const venuesRouter = require('./routes/venues');  // deve imprimir "📌 Rota de venues carregada!"
  const authRouter   = require('./routes/auth');    // deve imprimir "🔐 Rotas de auth carregadas"
  app.use('/api/venues', venuesRouter);
  app.use('/api/auth', authRouter);

  // --- Liga à BD e só depois arranca o servidor ---
  const PORT = process.env.PORT || 5000;

  mongoose.connect(rawUri)
    .then(() => {
      console.log('✅ Ligado ao MongoDB');
      app.listen(PORT, () => console.log(`🚀 Servidor a correr na porta ${PORT}`));
    })
    .catch(err => {
      console.error('❌ Erro ao ligar ao MongoDB:', err.message);
      process.exit(1);
    });
