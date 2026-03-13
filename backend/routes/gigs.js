const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const GigJob = require('../models/GigJob');
const Worker = require('../models/Worker');
const Application = require('../models/Application');
const { sendJobAlerts } = require('../ai/jobAlerts');
const { generateGigDescription } = require('../ai/gigGenerator');
const { detectFraud } = require('../ai/fraudDetection');
const { getMatchesForGig } = require('../ai/matchEngine');

// POST /api/gigs/generate - Generate structured gig from raw input
router.post('/generate', auth, async (req, res) => {
  try {
    const { description, hireType, payPerDay, duration, daysPerWeek, monthlyRate } = req.body;
    
    // 1. Generate description & structured data
    const aiResult = await generateGigDescription({
      description,
      hireType,
      payPerDay,
      duration,
      daysPerWeek,
      monthlyRate,
      companyType: req.user.role // Placeholder or logic for business type
    });

    // 2. Fraud check on the resulting content
    const fraudData = await detectFraud({
      title: aiResult.title,
      description: aiResult.description
    }, 'hirer');

    res.json({
      success: true,
      data: {
        ...aiResult,
        fraudCheck: fraudData
      }
    });
  } catch (err) {
    console.error('AI Generation Route Error:', err);
    res.status(500).json({ success: false, error: 'AI Generation Failed' });
  }
});
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hirer') {
      return res.status(403).json({ success: false, error: 'Only hirers can post gigs' });
    }

    const { rawInput, title, description, skillsRequired, payPerDay, monthlyRate, daysPerWeek, hireType, duration, location } = req.body;

    // AI Pipeline for Generation & Fraud Detection
    let finalTitle = title;
    let finalDesc = description;
    let finalSkills = skillsRequired;
    
    if (rawInput) {
      const generated = await generateGigDescription(rawInput);
      finalTitle = generated.title;
      finalDesc = generated.description;
      finalSkills = generated.skillsRequired;
    }

    const fraudCheck = await detectFraud({ title: finalTitle, description: finalDesc }, 'hirer');
    if (fraudCheck.isFraud) {
       return res.status(400).json({ success: false, error: "Suspicious gig listing detected. Cannot proceed." });
    }

    // Platform Fee Calc (8% for daily/part_time, 1x monthly for full_time)
    let totalPay = 0;
    let platformFee = 0;
    if (hireType === 'full_time') {
      platformFee = (monthlyRate || 0); // 1 month fee
    } else {
      totalPay = (payPerDay || 0) * (duration || 1);
      platformFee = Math.round(totalPay * 0.08); 
    }

    const newGig = new GigJob({
      hirerId: req.user.userId,
      hireType: hireType || 'daily_gig',
      title: finalTitle,
      description: finalDesc,
      skillsRequired: finalSkills || [],
      payPerDay,
      monthlyRate,
      daysPerWeek,
      duration,
      totalPay,
      platformFee,
      location,
      status: 'open'
    });

    await newGig.save();

    // Trigger segment-aware job alerts asynchronously
    sendJobAlerts(newGig).catch(err => console.error("Error in Job Alerts Hook", err));

    res.status(201).json({ success: true, data: newGig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// GET /api/gigs/browse - Browse gigs with filters (Segments B & C)
router.get('/browse', async (req, res) => {
  try {
    const { hireType, skill, maxDist, minPay, lat, lng } = req.query;
    let query = { status: 'open' };

    if (hireType) query.hireType = hireType;
    if (skill) query.skillsRequired = { $in: [skill.toLowerCase()] };
    
    if (lat && lng && maxDist) {
        query.location = {
            $near: {
                $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                $maxDistance: parseInt(maxDist) * 1000
            }
        };
    }

    if (minPay) {
      if (hireType === 'full_time') {
        query.monthlyRate = { $gte: parseInt(minPay) };
      } else {
        query.payPerDay = { $gte: parseInt(minPay) };
      }
    }

    const gigs = await GigJob.find(query)
      .populate('hirerId', 'businessName name rating')
      .sort({ postedAt: -1 });

    res.json({ success: true, data: gigs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// GET /api/gigs/:id/matches - Hirer views Daily Gig Matches
router.get('/:id/matches', auth, async (req, res) => {
  try {
    const gig = await GigJob.findById(req.params.id);
    if (!gig || String(gig.hirerId) !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Call match engine AI (Should take <50ms natively or generate Applications)
    const matches = await getMatchesForGig(gig._id);
    
    // Sort matches by highest score
    matches.sort((a,b) => b.matchScore - a.matchScore);

    res.json({ success: true, data: matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/gigs/:id/hire/:workerId - Hirer pays and hires worker (simulated)
router.post('/:id/hire/:workerId', auth, async (req, res) => {
  try {
    const { paymentConfirmed } = req.body;
    if (!paymentConfirmed) return res.status(400).json({ success: false, error: 'Payment required' });

    const gig = await GigJob.findById(req.params.id);
    if (!gig || String(gig.hirerId) !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    const worker = await Worker.findById(req.params.workerId);
    if (!worker) return res.status(404).json({ success: false, error: "Worker not found" });

    gig.status = 'payment_held';
    gig.paymentStatus = 'held_in_escrow';
    gig.hiredWorkerId = req.params.workerId;
    gig.paymentHeldAt = new Date();
    gig.workerTimeoutAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hrs
    await gig.save();

    // Trigger Telegram notification for Segment A worker
    const { notifyWorker } = require('../bot/telegramBot');
    const hirer = await Hirer.findById(req.user.userId);
    notifyWorker(worker, gig, hirer).catch(console.error);

    res.json({ success: true, data: gig });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/gigs/:id/accept - Worker accepts gig manually (override/web)
router.post('/:id/accept', auth, async (req, res) => {
  try {
     const gig = await GigJob.findById(req.params.id);
     if (!gig || String(gig.hiredWorkerId) !== req.user.userId) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
     }
     if (gig.status !== 'payment_held') {
        return res.status(400).json({ success: false, error: "Gig not in payment_held state" });
     }

     gig.status = 'worker_accepted';
     gig.contactRevealedAt = new Date();
     await gig.save();

     // Notify hirer via Push Notification
     const hirer = await Hirer.findById(gig.hirerId);
     const worker = await Worker.findById(req.user.userId);
     const { sendPush } = require('../services/pushService');
     if (hirer && hirer.pushSubscription) {
         sendPush(hirer.pushSubscription, {
             title: 'KaamSetu — Worker Accepted! ✅',
             body: `${worker.name} accepted your job! View contacts now.`,
             url: `/hirer/manage/${gig._id}`
         }).catch(console.error);
     }

     res.json({ success: true, data: gig });
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/gigs/:id/decline - Worker declines gig (override/web)
router.post('/:id/decline', auth, async (req, res) => {
  try {
     const gig = await GigJob.findById(req.params.id);
     if (!gig || String(gig.hiredWorkerId) !== req.user.userId) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
     }
     
     gig.status = 'cancelled';
     gig.paymentStatus = 'refunded';
     await gig.save();

     // Theoretically could hook up next worker here like Telegram bot does

     res.json({ success: true, data: gig });
  } catch(err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/gigs/:id/complete - Hirer marks gig completed
router.post('/:id/complete', auth, async (req, res) => {
   try {
     const gig = await GigJob.findById(req.params.id);
     if (!gig || String(gig.hirerId) !== req.user.userId) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
     }
     if (gig.status !== 'in_progress' && gig.status !== 'worker_accepted') {
        return res.status(400).json({ success: false, error: "Invalid state transition" });
     }

     gig.status = 'completed';
     gig.paymentStatus = 'released';
     await gig.save();

     res.json({ success: true, data: gig });
   } catch(err) {
       console.error(err);
       res.status(500).json({ success: false, error: 'Server Error' });
   }
});

// GET /api/gigs/:id/status
router.get('/:id/status', auth, async (req, res) => {
    try {
        const gig = await GigJob.findById(req.params.id)
            .populate('hiredWorkerId', 'name phone photo aadhaarNumber isAadhaarVerified -_id')
            .populate('hirerId', 'businessName phone -_id');
        
        if (!gig) { return res.status(404).json({ success: false, error: 'Not found' }) }

        // Strip phone numbers if not accepted
        if (gig.status !== 'worker_accepted' && gig.status !== 'in_progress' && gig.status !== 'completed') {
             if (gig.hiredWorkerId) gig.hiredWorkerId.phone = null;
             if (gig.hirerId) gig.hirerId.phone = null;
        }

        res.json({ success: true, data: gig });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// GET /api/gigs/my-gigs - Hirer views their own gigs
router.get('/my-gigs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hirer') {
      return res.status(403).json({ success: false, error: 'Only hirers can view their gigs' });
    }
    const gigs = await GigJob.find({ hirerId: req.user.userId })
        .populate('hiredWorkerId', 'name phone')
        .sort({ postedAt: -1 });
    res.json({ success: true, data: gigs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
