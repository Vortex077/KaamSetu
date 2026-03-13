/**
 * AI Match Engine — fully implemented.
 * Scores workers against gigs using 4 factors:
 *   Skills (max 40), Distance (max 30), Rating (max 20), Availability (max 10)
 */

/**
 * Haversine distance in km between two [lng, lat] coordinate pairs.
 */
function haversineDistance(coord1, coord2) {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate match score for a single worker against a gig.
 * @returns {{ totalScore, breakdown, distanceKm, matchedSkills }}
 */
function calculateMatchScore(gig, worker) {
  const breakdown = { skills: 0, distance: 0, rating: 0, availability: 0 };
  const matchedSkills = [];

  // --- 1. Skills score (max 40) ---
  const gigSkills = (gig.skillsRequired || []).map((s) => s.toLowerCase());
  const workerSkills = (worker.skills || []).map((s) => s.toLowerCase());

  if (gigSkills.length > 0) {
    gigSkills.forEach((skill) => {
      if (workerSkills.includes(skill)) matchedSkills.push(skill);
    });
    breakdown.skills = Math.round((matchedSkills.length / gigSkills.length) * 40);
  } else {
    breakdown.skills = 20; // If gig has no skill requirement, give half credit
  }

  // --- 2. Distance score (max 30) ---
  let distanceKm = 0;
  const gigCoords = gig.location?.coordinates;
  const workerCoords = worker.location?.coordinates;

  if (gigCoords && workerCoords && gigCoords[0] !== 0 && workerCoords[0] !== 0) {
    distanceKm = haversineDistance(gigCoords, workerCoords);
    if (distanceKm <= 2) breakdown.distance = 30;
    else if (distanceKm <= 5) breakdown.distance = 25;
    else if (distanceKm <= 10) breakdown.distance = 20;
    else if (distanceKm <= 15) breakdown.distance = 10;
    else breakdown.distance = 5;
  }

  // --- 3. Rating score (max 20) ---
  const rating = worker.rating || 0;
  breakdown.rating = Math.round((rating / 5) * 20);

  // --- 4. Availability score (max 10) ---
  if (worker.availability?.isAvailable) {
    breakdown.availability = 10;
  }

  const totalScore = breakdown.skills + breakdown.distance + breakdown.rating + breakdown.availability;

  return {
    matchScore: Math.min(totalScore, 100),
    breakdown,
    distanceKm: Math.round(distanceKm * 10) / 10,
    matchedSkills,
  };
}

const Worker = require('../models/Worker');

/**
 * Calculate match scores for multiple workers and return sorted (highest-first).
 */
function calculateMatchScores(gig, workers) {
  return workers
    .map((worker) => {
      const score = calculateMatchScore(gig, worker);
      return {
        worker: worker.toObject ? worker.toObject() : worker,
        ...score,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Fetch workers and get matches for a gig.
 * Implements the core AI matching logic.
 */
async function getMatchesForGig(gigId) {
  const GigJob = require('../models/GigJob');
  const gig = await GigJob.findById(gigId);
  if (!gig) return [];

  // 1. Fetch nearby workers (Radius: 20km) and match the segment type
  const coords = gig.location?.coordinates;
  let query = { 
    isAvailable: true,
    workerSegment: gig.hireType 
  };
  
  if (coords && coords[0] !== 0) {
    query.location = {
      $near: {
        $geometry: { type: "Point", coordinates: coords },
        $maxDistance: 20000 // 20km
      }
    };
  }

  const workers = await Worker.find(query).limit(50);
  
  // 2. Score them
  return calculateMatchScores(gig, workers);
}

module.exports = { 
  calculateMatchScore, 
  calculateMatchScores, 
  getMatchesForGig,
  haversineDistance 
};
