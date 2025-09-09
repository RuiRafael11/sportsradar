const mongoose = require('mongoose');

const VenueExtraSchema = new mongoose.Schema(
  {
    // usa o id tal como vem no cliente (ex: "g:ChIJ..."), assim não há dúvidas
    placeId: { type: String, required: true, unique: true, index: true },

    // podes estender à vontade; aqui replicamos os "details" do Venue
    details: {
      hasLockerRoom:   { type: Boolean, default: false },
      hasShowers:      { type: Boolean, default: false },
      hasLighting:     { type: Boolean, default: false },
      covered:         { type: Boolean, default: false },
      indoor:          { type: Boolean, default: false },
      parking:         { type: Boolean, default: false },
      equipmentRental: { type: Boolean, default: false },

      surface:         { type: String,  default: '' },
      lengthMeters:    { type: Number,  default: null },
      widthMeters:     { type: Number,  default: null },

      pricePerHour:    { type: Number,  default: null },
      currency:        { type: String,  default: 'EUR' },

      openingHours:    { type: String,  default: '' },
      contact: {
        phone:         { type: String,  default: '' },
        email:         { type: String,  default: '' },
        website:       { type: String,  default: '' },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VenueExtra', VenueExtraSchema);
