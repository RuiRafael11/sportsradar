require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 📌 Ligar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Ligado ao MongoDB'))
  .catch(err => console.error('Erro ao ligar ao MongoDB:', err));

// 📌 Importar e usar a rota
const venuesRouter = require('./routes/venues');
app.use('/api/venues', venuesRouter);

// 📌 Arrancar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));
