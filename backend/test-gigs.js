const mongoose = require('mongoose');
require('dotenv').config();
const GigJob = require('./models/GigJob');

async function test() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const allGigs = await GigJob.find({});
  console.log('Total gigs:', allGigs.length);
  
  const partTimeOpen = await GigJob.countDocuments({ hireType: 'part_time', status: 'open' });
  const fullTimeOpen = await GigJob.countDocuments({ hireType: 'full_time', status: 'open' });
  
  console.log('Part-time open:', partTimeOpen);
  console.log('Full-time open:', fullTimeOpen);
  
  if (partTimeOpen > 0 || fullTimeOpen > 0) {
      const sample = await GigJob.findOne({ hireType: { $in: ['part_time', 'full_time'] }, status: 'open' });
      console.log('Sample Open Gig Location:', sample.location);
  }
  process.exit(0);
}
test();
