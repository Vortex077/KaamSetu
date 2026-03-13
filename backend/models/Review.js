const mongoose = require('mongoose');

const Worker = require('./Worker');
const Hirer = require('./Hirer');

const ReviewSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: "GigJob", required: true },

  reviewerId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  reviewerRole: { type: String, enum: ["hirer", "worker"], required: true },

  revieweeId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  revieweeRole: { type: String, enum: ["hirer", "worker"], required: true },

  rating:  { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },

  createdAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ gigId: 1, reviewerId: 1 }, { unique: true });
ReviewSchema.index({ revieweeId: 1 });

// After every new Review — recalculate running average
ReviewSchema.statics.updateRating = async function(revieweeId, revieweeRole) {
  const Model = revieweeRole === "worker" ? mongoose.model('Worker') : mongoose.model('Hirer');
  const reviews = await this.find({ revieweeId, revieweeRole });
  const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  
  await Model.findByIdAndUpdate(revieweeId, {
    rating: Math.round(avg * 10) / 10,
    ...(revieweeRole === "worker" && { totalJobs: reviews.length })
  });
};

module.exports = mongoose.model('Review', ReviewSchema);
