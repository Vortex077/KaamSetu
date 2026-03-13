const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Application = require('../models/Application');
const GigJob = require('../models/GigJob');
const Worker = require('../models/Worker');
const Hirer = require('../models/Hirer');
const { sendPush } = require('../services/pushService');
const { bot } = require('../bot/telegramBot');

// POST /api/applications (Worker self-applies to B & C Segment Gigs)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ success: false, error: 'Only workers can apply' });
    }

    const { gigId, coverNote } = req.body;
    const gig = await GigJob.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, error: 'Gig not found' });

    if (gig.hireType === 'daily_gig') {
      return res.status(400).json({ success: false, error: 'Daily gigs are push-matched via AI only' });
    }

    const newApp = new Application({
      gigId,
      workerId: req.user.userId,
      applicationMethod: 'self_applied',
      status: 'applied',
      coverNote
    });

    await newApp.save();

    res.status(201).json({ success: true, data: newApp });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, error: 'Already applied' });
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// GET /api/applications/my (Worker returning their own applications)
router.get('/my', auth, async (req, res) => {
   try {
     if (req.user.role !== 'worker') {
         return res.status(403).json({ success: false, error: 'Workers only' });
     }
     const apps = await Application.find({ workerId: req.user.userId, applicationMethod: 'self_applied' })
       .populate('gigId', 'title payPerDay monthlyRate status')
       .sort({ createdAt: -1 });

     res.json({ success: true, data: apps });
   } catch (err) {
       console.error(err);
       res.status(500).json({ success: false, error: 'Server Error' });
   }
});

// GET /api/applications/received (Hirer sees self_applied apps)
router.get('/received', auth, async (req, res) => {
   try {
     if (req.user.role !== 'hirer') {
        return res.status(403).json({ success: false, error: 'Hirers only' });
     }

     const { gigId } = req.query;
     if (!gigId) return res.status(400).json({ success: false, error: 'gigId required' });

     const apps = await Application.find({ gigId, applicationMethod: 'self_applied' })
       .populate('workerId', 'name skills rating aadhaarNumber isAadhaarVerified photo photo')
       .sort({ createdAt: -1 });

     res.json({ success: true, data: apps });
   } catch(err) {
       console.error(err);
       res.status(500).json({ success: false, error: 'Server Error' });
   }
});

// POST /api/applications/:id/accept (Hirer accepts self_applied application)
router.post('/:id/accept', auth, async (req, res) => {
    try {
        if (req.user.role !== 'hirer') return res.status(403).json({ success: false, error: 'Unauthorized' });

        const app = await Application.findById(req.params.id).populate('gigId').populate('workerId');
        if (!app) return res.status(404).json({ success: false, error: 'Context not found' });
        
        if (String(app.gigId.hirerId) !== req.user.userId) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const gig = app.gigId;
        const worker = app.workerId;
        const hirer = await Hirer.findById(req.user.userId);

        app.status = 'hired';
        app.hiredAt = new Date();
        await app.save();

        gig.status = 'worker_accepted'; // Self applications skip payment_held and go directly to accepted (since they voluntarily applied)
        gig.hiredWorkerId = worker._id;
        gig.contactRevealedAt = new Date();
        await gig.save();

        // Notify Worker via Push
        if (worker.pushSubscription) {
            sendPush(worker.pushSubscription, {
                title: 'KaamSetu — Application Accepted! 🎉',
                body: `${hirer.businessName || hirer.name} ne aapki application accept ki hai!`,
                url: `/worker/applications`
            }).catch(console.error);
        }

        // Notify Worker via Telegram (if connected)
        if (worker.telegramChatId) {
            bot.sendMessage(
              worker.telegramChatId,
              `🎉 *Badhai Ho!*\n\n${hirer.businessName || hirer.name} ne aapki application accept kar li hai. Aap portal par jakar details dekh sakte hain.`,
              { parse_mode: 'Markdown' }
            ).catch(console.error);
        }

        // Auto-reject other apps
        await Application.updateMany(
            { gigId: gig._id, _id: { $ne: app._id } },
            { $set: { status: 'rejected' } }
        );

        res.json({ success: true, data: app });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
