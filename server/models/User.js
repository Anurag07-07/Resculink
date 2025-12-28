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
  associatedNGO: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For volunteers - which NGO they belong to
  
  // NGO Verification Fields (Security Protection)
  isVerified: { type: Boolean, default: false }, // Admin approval required for NGOs
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: function() {
      return this.role === 'ngo' ? 'pending' : 'approved';
    }
  },
  organizationName: { type: String }, // Required for NGOs
  organizationEmail: { type: String }, // Official NGO email
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Which admin verified
  verifiedAt: { type: Date }, // When verified
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
