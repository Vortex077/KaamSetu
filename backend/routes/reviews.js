const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Review = require('../models/Review');
const GigJob = require('../models/GigJob');

// POST /api/reviews
router.post('/', auth, async (req, res) => {
  try {
    const { gigId, revieweeId, role, rating, comment } = req.body;

    const gig = await GigJob.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, error: 'Gig not found' });
    if (gig.status !== 'completed') return res.status(400).json({ success: false, error: 'Gig must be completed to review' });

    // Enforce role structure: if I am a worker, I must review the hirer, etc.
    const reviewerRole = req.user.role;
    const revieweeRole = reviewerRole === 'worker' ? 'hirer' : 'worker';

    // Verify participants
    if (reviewerRole === 'worker' && String(gig.hiredWorkerId) !== req.user.userId) {
        return res.status(403).json({ success: false, error: 'You are not the hired worker' });
    }
    if (reviewerRole === 'hirer' && String(gig.hirerId) !== req.user.userId) {
        return res.status(403).json({ success: false, error: 'You are not the hirer' });
    }

    const newReview = new Review({
      gigId,
      reviewerId: req.user.userId,
      reviewerRole,
      revieweeId,
      revieweeRole,
      rating,
      comment
    });

    await newReview.save();
    
    // Call the static hook we just implemented in the model
    await Review.updateRating(revieweeId, revieweeRole);

    res.status(201).json({ success: true, data: newReview });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, error: 'You have already reviewed this gig' });
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
