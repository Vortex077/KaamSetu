const mongoose = require('mongoose');

// Handles all 3 worker segments in one collection
// workerSegment field drives which flows apply

const WorkerSchema = new mongoose.Schema({
  // Identity & Auth
  name:     { type: String, required: true },
  phone:    { type: String, required: true, unique: true },
  email:    { type: String },
  password: { type: String },        // null for Telegram-only workers
  role:     { type: String, default: "worker" },

  // Which segment this worker belongs to
  workerSegment: {
    type: String,
    enum: [
      "daily_gig",   // Segment A — uneducated, Telegram only
      "part_time",   // Segment B — student, website + Telegram
      "full_time"    // Segment C — educated, website primary
    ],
    default: "daily_gig"
  },

  // Profile
  photo:      { type: String },
  skills:     { type: [String], default: [] }, // English lowercase always
  dailyRate:  { type: Number,   default: 0 },  // for daily_gig and part_time
  monthlyRate: { type: Number,  default: 0 },  // for full_time
  experience: { type: String },

  // Location — GeoJSON Point
  // CRITICAL: coordinates are [longitude, latitude] — lng FIRST always
  location: {
    type:        { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
    city:        { type: String },
    address:     { type: String }
  },

  // Availability
  isAvailable: { type: Boolean, default: true },

  // For part_time segment — which days they can work
  availableDays: {
    type: [String],
    enum: ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],
    default: []
  },

  // Job preferences for Segments B & C — drives smart notifications
  // When a new gig matches ALL these preferences, worker gets notified
  jobPreferences: {
    skills:      { type: [String], default: [] },  // preferred skill types
    maxDistance: { type: Number,   default: 20 },  // km radius
    minPay:      { type: Number,   default: 0 },   // min daily/monthly rate
    jobType:     {
      type: String,
      enum: ["any", "daily_gig", "part_time", "full_time"],
      default: "any"
    }
  },

  // Telegram — Segment A primary, B & C optional
  telegramChatId:   { type: String, default: null },
  telegramUsername: { type: String, default: null },

  // Browser push subscription — Segments B & C
  pushSubscription: { type: Object, default: null },
  // Stored as full PushSubscription JSON object

  // Aadhaar — architecture-ready, UIDAI API pending approval
  aadhaarNumber:     { type: String,  default: null }, // stored encrypted
  isAadhaarVerified: { type: Boolean, default: false },
  // Displayed as "Verification Pending" until UIDAI integration live

  // Email verification
  isEmailVerified: { type: Boolean, default: false },
  emailOTP:        { type: String,  default: null },
  emailOTPExpiry:  { type: Date,    default: null },

  // Reputation
  rating:    { type: Number, default: 0 },
  totalJobs: { type: Number, default: 0 },

  // Meta
  registrationMethod: {
    type:    String,
    enum:    ["web", "telegram_voice"],
    default: "web"
  },
  isVerified: { type: Boolean, default: false },
  createdAt:  { type: Date,    default: Date.now }
});

// CRITICAL INDEXES
WorkerSchema.index({ location: "2dsphere" });
WorkerSchema.index({ workerSegment: 1 });         // filter by segment
WorkerSchema.index({ "jobPreferences.skills": 1 }); // fast preference matching

module.exports = mongoose.model('Worker', WorkerSchema);
