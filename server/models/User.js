const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['victim', 'volunteer', 'admin', 'ngo'], default: 'victim' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  phone: { type: String },
  isAvailable: { type: Boolean, default: true }, // For volunteers
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
