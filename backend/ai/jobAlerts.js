const { sendPush } = require('../services/pushService');
const { bot } = require('../bot/telegramBot');
const Hirer = require('../models/Hirer');
const Worker = require('../models/Worker');
const { getMatchesForGig } = require('./matchEngine');

// Calculate distance between two coordinates in meters
function calculateDistance(coord1, coord2) {
  if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) return 0;
  const lat1 = coord1[1];
  const lon1 = coord1[0];
  const lat2 = coord2[1];
  const lon2 = coord2[0];

  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

const sendJobAlerts = async (gig) => {
  const hirer = await Hirer.findById(gig.hirerId);
  if (!hirer) return;

  if (gig.hireType === 'daily_gig') {
    // Run AI match engine — notify top 5 Segment A workers via Telegram
    // This assumes getMatchesForGig writes the 'ai_matched' Application documents
    const matches = await getMatchesForGig(gig._id);
    const top5    = matches.filter(m => m.matchScore > 60).slice(0, 5);

    for (const match of top5) {
      const worker = match.workerId; // Assuming matchEngine popupates workerId completely
      if (!worker || !worker.telegramChatId) continue;
      // Only Telegram for daily gig workers
      bot.sendMessage(
        worker.telegramChatId,
        `🔔 *Nazdeeq mein kaam aya!*\n\n` +
        `💼 ${gig.title}\n🏪 ${hirer.businessName || hirer.name}\n` +
        `💰 ₹${gig.payPerDay}/din\n📍 ${match.distanceKm}km door\n\n` +
        `Apply: ${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/worker/jobs`,
        { parse_mode: 'Markdown' }
      );
    }

  } else {
    // part_time or full_time — notify Segment B & C workers
    // Match by jobPreferences, not AI score
    const interestedWorkers = await Worker.find({
      workerSegment: gig.hireType,
      isAvailable:   true,
      'jobPreferences.skills': { $in: gig.skillsRequired }
    }).limit(50);

    const hq = gig.location.coordinates;
    const qualified = interestedWorkers.filter(w => {
      if (!w.location || !w.location.coordinates) return false;
      const dist   = calculateDistance(w.location.coordinates, hq) / 1000;
      
      let payOk = false;
      if (gig.hireType === 'full_time') {
        payOk = (gig.monthlyRate || 0) >= (w.jobPreferences.minPay || 0);
      } else {
        payOk = (gig.payPerDay || 0) >= (w.jobPreferences.minPay || 0);
      }
      
      const maxDist = w.jobPreferences.maxDistance || 20;
      return dist <= maxDist && payOk;
    }).slice(0, 20); // notify up to 20 for part/full time

    for (const worker of qualified) {
      const payload = {
        title: 'KaamSetu — Naya Kaam!',
        body:  `${gig.title} | ${hirer.businessName || hirer.name} | Apply now`,
        url:   `/worker/jobs?id=${gig._id}`
      };

      // Browser push
      if (worker.pushSubscription) {
        await sendPush(worker.pushSubscription, payload);
      }

      // Telegram (if connected)
      if (worker.telegramChatId) {
        let titleTag = gig.hireType === 'part_time' ? 'Part-time' : 'Full-time';
        let payTag = gig.hireType === 'full_time' ? gig.monthlyRate + '/month' : gig.payPerDay + '/din';
        bot.sendMessage(
          worker.telegramChatId,
          `🔔 *Naya ${titleTag} Kaam!*\n\n` +
          `💼 ${gig.title}\n🏪 ${hirer.businessName || hirer.name}\n` +
          `💰 ₹${payTag}\n\n` +
          `Apply: ${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/worker/jobs?id=${gig._id}`,
          { parse_mode: 'Markdown' }
        );
      }
    }
  }
};

module.exports = { sendJobAlerts };
