// backend/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },

    date:  { type: String, required: true }, // "YYYY-MM-DD"
    time:  { type: String, required: true }, // "HH:mm"
    notes: { type: String },

    status: {
      type: String,
      enum: ['pending', 'paid', 'confirmed', 'cancelled'],
      default: 'pending',
      required: true,
    },

    paymentIntentId: { type: String },
    receiptUrl:      { type: String },

    amount:   { type: Number, default: 1200 }, // em cêntimos
    currency: { type: String, default: 'eur' },
  },
  { timestamps: true }
);

// Evita OverwriteModelError em hot-reload
module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
