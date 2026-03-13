const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Worker = require('../models/Worker');
const Hirer = require('../models/Hirer');

// POST /api/notifications/subscribe
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ success: false, error: 'Subscription required' });
    }

    const Model = req.user.role === 'worker' ? Worker : Hirer;
    await Model.findByIdAndUpdate(req.user.userId, { pushSubscription: subscription });

    res.json({ success: true, message: 'Push subscription saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// DELETE /api/notifications/unsubscribe
router.delete('/unsubscribe', auth, async (req, res) => {
  try {
    const Model = req.user.role === 'worker' ? Worker : Hirer;
    await Model.findByIdAndUpdate(req.user.userId, { pushSubscription: null });

    res.json({ success: true, message: 'Push subscription removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
