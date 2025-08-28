const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false }, // nunca sai por defeito
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
