// backend/models/Booking.js
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const bookingSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },

    // Quando é um recinto da tua BD (opcional)
    venue: { type: Types.ObjectId, ref: 'Venue' },

    // ID universal do recinto: pode ser ObjectId (string) ou 'g:...'
    venueId: { type: String, required: true },

    // Metadados que mostramos SEMPRE (se interno, são copiados do Venue)
    venueName: { type: String, default: '' },
    venueType: { type: String, default: '' },
    venueDistrict: { type: String, default: '' },
    venueAddress: { type: String, default: '' },
    imageUrl: { type: String, default: '' },

    // Dados da reserva
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    time: { type: String, required: true }, // 'HH:mm'
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },

    // Pagamento
    paymentIntentId: { type: String, default: null },
    receiptUrl: { type: String, default: null },
    amount: { type: Number, default: 0 },     // em cêntimos
    currency: { type: String, default: 'eur' },
  },
  { timestamps: true }
);

// Evita recompilação em hot reload
module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
