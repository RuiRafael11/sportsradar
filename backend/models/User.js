const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },

    // Push
    expoPushToken: { type: String, select: false },

    // Preferências do utilizador
    preferences: {
      radiusMeters: { type: Number, default: 5000 }, // 5 km
      sports: { type: [String], default: [] },       // ex: ["padel","futebol"]
      homeLocation: {
        lat: { type: Number },
        lng: { type: Number },
      }
    },

    // Aceitação legal
    termsAcceptedAt:   { type: Date },
    privacyAcceptedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
