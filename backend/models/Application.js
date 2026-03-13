const mongoose = require('mongoose');

// Used for Segment B & C workers who apply themselves
// Also used for Segment A AI matches (worker doesn't see it)

const ApplicationSchema = new mongoose.Schema({
  gigId:    { type: mongoose.Schema.Types.ObjectId, ref: "GigJob",  required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker",  required: true },

  // How this application was created
  applicationMethod: {
    type: String,
    enum: [
      "ai_matched",     // Segment A — hirer sees in AI match results
      "self_applied"    // Segment B & C — worker applied from website
    ],
    default: "ai_matched"
  },

  // AI match score — stored permanently, never recalculate
  matchScore: { type: Number, default: 0 },
  scoreBreakdown: {
    skills:       { type: Number, default: 0 }, // max 40
    distance:     { type: Number, default: 0 }, // max 30
    rating:       { type: Number, default: 0 }, // max 20
    availability: { type: Number, default: 0 }  // max 10
  },
  distanceKm:    { type: Number },
  matchedSkills: { type: [String] },

  // Cover note for Segment B & C applications
  coverNote: { type: String, default: null },

  status: {
    type: String,
    enum: ["matched", "applied", "hired", "rejected", "completed"],
    default: "matched"
    // matched = ai_matched but not yet applied
    // applied = worker self-applied (Seg B & C)
  },

  createdAt: { type: Date, default: Date.now },
  hiredAt:   { type: Date }
});

ApplicationSchema.index({ gigId: 1, workerId: 1 }, { unique: true });
ApplicationSchema.index({ workerId: 1 });
ApplicationSchema.index({ gigId: 1 });
ApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
