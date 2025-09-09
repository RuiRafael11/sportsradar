// backend/models/Venue.js
const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema(
  {
    // Identificação básica
    name:     { type: String, required: true, trim: true },
    district: { type: String, default: '', trim: true },
    type:     { type: String, default: '', trim: true },

    // Opcional: imagem e morada
    address:  { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '' },

    // Alugável e notas livres
    rentable: { type: Boolean, default: true },
    notes:    { type: String, default: '' },

    /**
     * Detalhes / amenities
     * Todos com defaults para não partir documentos antigos.
     */
    details: {
      hasLockerRoom:     { type: Boolean, default: false }, // balneários
      hasShowers:        { type: Boolean, default: false }, // duches
      hasLighting:       { type: Boolean, default: false }, // iluminação noturna
      covered:           { type: Boolean, default: false }, // coberto
      indoor:            { type: Boolean, default: false }, // interior
      parking:           { type: Boolean, default: false }, // estacionamento
      equipmentRental:   { type: Boolean, default: false }, // aluga material

      surface:           { type: String,  default: '' },    // piso: relva/terra/betão/vinil
      lengthMeters:      { type: Number,  default: null },
      widthMeters:       { type: Number,  default: null },

      pricePerHour:      { type: Number,  default: null },  // em euros
      currency:          { type: String,  default: 'EUR' },

      openingHours:      { type: String,  default: '' },    // texto livre

      contact: {
        phone:           { type: String,  default: '' },
        email:           { type: String,  default: '' },
        website:         { type: String,  default: '' },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Venue', VenueSchema);
