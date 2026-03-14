const express = require('express');
const router = express.Router();
const fs = require('fs');
const { auth } = require('../middleware/auth');
const GigJob = require('../models/GigJob');
const Worker = require('../models/Worker');
const Hirer = require('../models/Hirer');
const Application = require('../models/Application');
const { sendJobAlerts } = require('../ai/jobAlerts');
const { generateGigDescription } = require('../ai/gigGenerator');
const { getMatchesForGig } = require('../ai/matchEngine');

// POST /api/gigs/generate - Generate structured gig from raw input
router.post('/generate', auth, async (req, res) => {
  try {
    const { description, hireType, payPerDay, duration, daysPerWeek, monthlyRate } = req.body;
    console.log('[AI Generate] Request Body:', req.body);
    
    // AI Generation (Bypassing Fraud Detection for Hackathon)
    const aiResult = await generateGigDescription({
      description,
      hireType,
      payPerDay,
      duration,
      daysPerWeek,
      monthlyRate,
      companyType: req.user.role 
    });

    console.log('[AI Generate] Result:', aiResult);

    res.json({
      success: true,
      data: aiResult
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

    // AI Pipeline for Generation (Fraud Detection Bypassed)
    let finalTitle = title;
    let finalDesc = description;
    let finalSkills = skillsRequired;
    
    if (rawInput) {
      const generated = await generateGigDescription(rawInput);
      finalTitle = generated.title;
      finalDesc = generated.description;
      finalSkills = generated.skillsRequired;
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
    
    if (lat && lng && maxDist && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
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
    const start = Date.now();
    const matches = await getMatchesForGig(gig._id);
    const matchTimeMs = Date.now() - start;
    
    // Sort matches by highest score (already done in getMatchesForGig, but making sure)
    matches.sort((a,b) => b.matchScore - a.matchScore);

    res.json({ 
      success: true, 
      data: {
        gig,
        matches,
        matchTimeMs
      }
    });
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

    // Branch notifications based on hireType
    const hirer = await Hirer.findById(req.user.userId);
    
    if (gig.hireType === 'daily_gig') {
      const { notifyWorker } = require('../bot/telegramBot');
      notifyWorker(worker, gig, hirer).catch(console.error);
    } else {
      const { sendHiringEmail } = require('../services/emailService');
      sendHiringEmail(worker, gig, hirer).catch(console.error);
    }

    res.json({ success: true, data: gig });
  } catch (err) {
    console.error('[Hire Route Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
});

// GET /api/gigs/:id/accept-via-email - Worker clicks link in email
router.get('/:id/accept-via-email', async (req, res) => {
  try {
    const { workerId } = req.query;
    const gig = await GigJob.findById(req.params.id);
    
    if (!gig) return res.send('<h1>Gig not found</h1>');
    if (String(gig.hiredWorkerId) !== workerId) return res.send('<h1>Unauthorized</h1>');
    if (gig.status === 'worker_accepted') return res.send('<h1>Already accepted!</h1>');
    if (gig.status !== 'payment_held') return res.send('<h1>This opportunity has expired or been cancelled.</h1>');

    gig.status = 'worker_accepted';
    gig.contactRevealedAt = new Date();
    await gig.save();

    // Notify hirer via Push Notification
    const hirer = await Hirer.findById(gig.hirerId);
    const worker = await Worker.findById(workerId);
    const { sendPush } = require('../services/pushService');
    if (hirer && hirer.pushSubscription) {
        sendPush(hirer.pushSubscription, {
            title: 'KaamSetu — Job Accepted! ✅',
            body: `${worker.name} accepted your job via email! View contacts now.`,
            url: `/hirer/manage`
        }).catch(console.error);
    }

    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding:50px;">
        <h1 style="color:#2D6A4F">Job Accepted Successfully! ✅</h1>
        <p>You have accepted <b>${gig.title}</b>.</p>
        <p>The hirer has been notified. You can now contact them or wait for their call.</p>
        <p>Hirer Phone: <b>${hirer.phone}</b></p>
        <br/>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/worker/profile" style="color:#FF6B35; font-weight:bold; text-decoration:none;">Go to KaamSetu Dashboard</a>
      </div>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
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

     // If Telegram Worker, Ask for Voice Review
     if (gig.hireType === 'daily_gig') {
         const worker = await Worker.findById(gig.hiredWorkerId);
         if (worker && worker.telegramChatId) {
             const { bot } = require('../bot/telegramBot');
             bot.sendMessage(worker.telegramChatId, `🎉 *Kaam poora ho gaya!*\n\n` + 
                `Aapko hirer ka kaam kaisa laga? Apna anubhav ek *Voice Note* bhej kar record karein (Rate 1-5 aur feedback).`, 
                { parse_mode: 'Markdown' });
         }
     }

     res.json({ success: true, data: gig });
   } catch(err) {
       console.error(err);
       res.status(500).json({ success: false, error: 'Server Error' });
   }
});

// POST /api/gigs/:id/review/worker - Hirer reviews the Worker
router.post('/:id/review/worker', auth, async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, error: "Invalid rating" });

        const gig = await GigJob.findById(req.params.id);
        if (!gig || String(gig.hirerId) !== req.user.userId || gig.status !== 'completed' || gig.workerReviewed) {
           return res.status(403).json({ success: false, error: "Cannot review this gig" });
        }

        const worker = await Worker.findById(gig.hiredWorkerId);
        if (!worker) return res.status(404).json({ success: false, error: "Worker not found" });

        // Add review
        worker.reviews = worker.reviews || [];
        worker.reviews.push({
            gigId: gig._id,
            hirerId: req.user.userId,
            rating,
            feedback
        });
        
        // Recalculate average rating
        const totalRating = worker.reviews.reduce((sum, rev) => sum + (rev.rating || 5), 0);
        worker.rating = totalRating / worker.reviews.length;
        worker.totalJobs = (worker.totalJobs || 0) + 1;
        await worker.save();

        gig.workerReviewed = true;
        await gig.save();

        res.json({ success: true, message: "Review saved" });
    } catch(err) {
        fs.writeFileSync('backend-error.log', err.stack || err.toString());
        console.error(err);
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
});

// POST /api/gigs/:id/review/hirer - Worker (Web) reviews the Hirer
router.post('/:id/review/hirer', auth, async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, error: "Invalid rating" });

        const gig = await GigJob.findById(req.params.id);
        if (!gig || String(gig.hiredWorkerId) !== req.user.userId || gig.status !== 'completed' || gig.hirerReviewed) {
           return res.status(403).json({ success: false, error: "Cannot review this gig" });
        }

        const hirer = await Hirer.findById(gig.hirerId);
        if (!hirer) return res.status(404).json({ success: false, error: "Hirer not found" });

        // Add review
        hirer.reviews = hirer.reviews || [];
        hirer.reviews.push({
            gigId: gig._id,
            workerId: req.user.userId,
            rating,
            feedback
        });
        
        // Recalculate average rating
        const totalRating = hirer.reviews.reduce((sum, rev) => sum + (rev.rating || 5), 0);
        hirer.rating = totalRating / hirer.reviews.length;
        hirer.totalHires = (hirer.totalHires || 0) + 1;
        await hirer.save();

        gig.hirerReviewed = true;
        await gig.save();

        res.json({ success: true, message: "Review saved" });
    } catch(err) {
        fs.writeFileSync('backend-error.log', err.stack || err.toString());
        console.error(err);
        res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
});

// GET /api/gigs/:id/status
router.get('/:id/status', auth, async (req, res) => {
    try {
        const gig = await GigJob.findById(req.params.id)
            .populate('hiredWorkerId', 'name phone email photo aadhaarNumber isAadhaarVerified -_id')
            .populate('hirerId', 'businessName phone email -_id');
        
        if (!gig) { return res.status(404).json({ success: false, error: 'Not found' }) }

        // Strip contact info if not accepted
        if (gig.status !== 'worker_accepted' && gig.status !== 'in_progress' && gig.status !== 'completed') {
             if (gig.hiredWorkerId) {
                gig.hiredWorkerId.phone = null;
                gig.hiredWorkerId.email = null;
             }
             if (gig.hirerId) {
                gig.hirerId.phone = null;
                gig.hirerId.email = null;
             }
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
        .populate('hiredWorkerId', 'name phone email')
        .sort({ postedAt: -1 });
    res.json({ success: true, data: gigs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
