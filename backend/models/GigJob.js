const mongoose = require('mongoose');

const GigJobSchema = new mongoose.Schema({
  hirerId: { type: mongoose.Schema.Types.ObjectId, ref: "Hirer", required: true },

  // Hire type — determines pay model and worker segment targeted
  hireType: {
    type: String,
    enum: ["daily_gig", "part_time", "full_time"],
    default: "daily_gig"
  },

  title:          { type: String, required: true },
  description:    { type: String },
  skillsRequired: { type: [String], default: [] }, // English lowercase

  // Pay fields — which ones are used depends on hireType
  payPerDay:    { type: Number }, // daily_gig and part_time
  daysPerWeek:  { type: Number }, // part_time only (1-6)
  monthlyRate:  { type: Number }, // full_time only
  duration:     { type: Number, default: 1 }, // days for daily_gig

  // Computed fields — set on save
  totalPay:     { type: Number }, // payPerDay × duration for daily_gig
  platformFee:  { type: Number }, // 8% for daily/part_time, 1 month for full_time

  location: {
    type:        { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] },
    city:        { type: String },
    address:     { type: String }
  },

  // PAYMENT STATE MACHINE — same for all hire types
  // Never skip states. Always transition in order.
  status: {
    type: String,
    enum: [
      "open",            // posted, awaiting hire
      "payment_pending", // hirer clicked hire, not paid yet
      "payment_held",    // escrow funded, worker notified
      "worker_accepted", // worker confirmed, contacts revealed
      "in_progress",     // job happening
      "completed",       // done, payment released
      "cancelled"        // declined / timeout / dispute
    ],
    default: "open"
  },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "held_in_escrow", "released", "refunded"],
    default: "unpaid"
  },

  hiredWorkerId:     { type: mongoose.Schema.Types.ObjectId, ref: "Worker", default: null },
  paymentHeldAt:     { type: Date, default: null },
  workerTimeoutAt:   { type: Date, default: null }, // + 2 hours
  contactRevealedAt: { type: Date, default: null },

  workerReviewed: { type: Boolean, default: false },
  hirerReviewed:  { type: Boolean, default: false },

  postedAt:  { type: Date, default: Date.now },
  startDate: { type: Date },
  endDate:   { type: Date }
});

// CRITICAL INDEXES
GigJobSchema.index({ location: "2dsphere" });
GigJobSchema.index({ status: 1, postedAt: -1 });
GigJobSchema.index({ hirerId: 1 });
GigJobSchema.index({ hireType: 1, status: 1 }); // filter by hire type

module.exports = mongoose.model('GigJob', GigJobSchema);
