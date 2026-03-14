const mongoose = require('mongoose');
require('dotenv').config();
const GigJob = require('./models/GigJob');
const Worker = require('./models/Worker');
const Hirer = require('./models/Hirer');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const gig = await GigJob.findOne({ status: 'completed', workerReviewed: false });
  if (!gig) {
    console.log('No eligible gig found');
    process.exit(0);
  }
  
  console.log('Found gig:', gig._id, 'hiredWorker:', gig.hiredWorkerId);
  const worker = await Worker.findById(gig.hiredWorkerId);
  if (!worker) {
     console.log('Worker not found');
     process.exit(0);
  }
  
  try {
     worker.reviews.push({
         gigId: gig._id,
         hirerId: gig.hirerId,
         rating: 5,
         feedback: "Test script review"
     });
     
     const totalRating = worker.reviews.reduce((sum, rev) => sum + rev.rating, 0);
     worker.rating = totalRating / worker.reviews.length;
     worker.totalJobs = (worker.totalJobs || 0) + 1;
     
     await worker.save();
     console.log('Worker saved successfully!');
  } catch(e) {
     console.error('Validation Error:', e);
  }
  process.exit(0);
}
test();
