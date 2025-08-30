const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    date: {
      type: String, // formato "YYYY-MM-DD"
      required: true,
    },
    time: {
      type: String, // formato "HH:mm"
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
