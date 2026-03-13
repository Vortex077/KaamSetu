const mongoose = require('mongoose');

const HirerSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  phone:    { type: String, required: true, unique: true },
  email:    { type: String },
  password: { type: String, required: true },
  role:     { type: String, default: "hirer" },

  businessName: { type: String },
  businessType: {
    type: String,
    enum: ["shop", "restaurant", "household", "factory", "farm", "other"]
  },

  location: {
    type:        { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
    city:        { type: String },
    address:     { type: String }
  },

  // Browser push subscription — for job acceptance notifications
  pushSubscription: { type: Object, default: null },

  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  emailOTP:        { type: String,  default: null },
  emailOTPExpiry:  { type: Date,    default: null },

  isVerified:  { type: Boolean, default: false },
  totalHires:  { type: Number,  default: 0 },
  rating:      { type: Number,  default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hirer', HirerSchema);
