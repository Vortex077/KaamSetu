const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Worker = require('../models/Worker');
const GigJob = require('../models/GigJob');
const Application = require('../models/Application');
const { processVoiceRegistration } = require('../ai/voiceRegistration');

// GET /api/workers/profile
router.get('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ success: false, error: 'Workers only' });
    const worker = await Worker.findById(req.user.userId);
    res.json({ success: true, data: worker });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/workers/profile
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ success: false, error: 'Workers only' });
    let worker = await Worker.findByIdAndUpdate(req.user.userId, { $set: req.body }, { new: true });
    res.json({ success: true, data: worker });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/workers/preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ success: false, error: 'Workers only' });
    const { jobPreferences } = req.body;
    let worker = await Worker.findByIdAndUpdate(req.user.userId, { jobPreferences }, { new: true });
    res.json({ success: true, data: worker });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/workers/voice-register
// Optional route for clients to upload voice bytes instead of Telegram
router.post('/voice-register', async (req, res) => {
  try {
    const audioUrl = req.body.audioUrl;
    if (!audioUrl) return res.status(400).json({ success: false, error: 'Audio URL required' });
    const profile = await processVoiceRegistration(audioUrl, null);
    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error processing voice' });
  }
});

// GET /api/workers/jobs/nearby
// Legacy endpoint for Segment A fetching active gigs directly, or mapping
router.get('/jobs/nearby', auth, async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ success: false, error: 'Workers only' });
    const worker = await Worker.findById(req.user.userId);
    if (!worker.location || !worker.location.coordinates) return res.json({ success: true, data: [] });

    const maxDistance = 20000; // 20 km
    const gigs = await GigJob.find({
      status: 'open',
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: worker.location.coordinates },
          $maxDistance: maxDistance
        }
      }
    });
    res.json({ success: true, data: gigs });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/workers/applications
router.get('/applications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'worker') return res.status(403).json({ success: false, error: 'Workers only' });
    const apps = await Application.find({ workerId: req.user.userId })
      .populate('gigId')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/workers/:id
// Public Profile Route
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).select('-password -telegramChatId -emailOTP -pushSubscription');
    if (!worker) return res.status(404).json({ success: false, error: 'Worker not found' });
    res.json({ success: true, data: worker });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
