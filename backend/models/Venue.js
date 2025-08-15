const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  district: String,
  name: String,
  type: String,
  rentable: Boolean,
  notes: String
});

module.exports = mongoose.model('Venue', VenueSchema);
