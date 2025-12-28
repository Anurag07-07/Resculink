const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Food', 'Medical', 'Shelter', 'Rescue', 'Other'], required: true },
  urgency: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('Request', RequestSchema);
