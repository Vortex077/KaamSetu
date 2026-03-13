/**
 * Seed script — populate DB with demo data.
 * Run: node seedData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Hirer = require('./models/Hirer');
const Worker = require('./models/Worker');
const GigJob = require('./models/GigJob');
const Application = require('./models/Application');
const Review = require('./models/Review');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Hirer.deleteMany({}),
      Worker.deleteMany({}),
      GigJob.deleteMany({}),
      Application.deleteMany({}),
      Review.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // --- Hirers ---
    const hirers = await Hirer.insertMany([
      {
        name: 'Ramesh Sharma',
        phone: '9876543210',
        email: 'ramesh@example.com',
        password: hashedPassword,
        businessName: 'Sharma Electronics',
        businessType: 'shop',
        location: { type: 'Point', coordinates: [77.2090, 28.6139], city: 'New Delhi', address: 'Connaught Place' },
        isVerified: true,
      },
      {
        name: 'Priya Patel',
        phone: '9876543211',
        email: 'priya@example.com',
        password: hashedPassword,
        businessName: 'Patel Restaurant',
        businessType: 'restaurant',
        location: { type: 'Point', coordinates: [72.8777, 19.0760], city: 'Mumbai', address: 'Andheri West' },
        isVerified: true,
      },
      {
        name: 'Amit Gupta',
        phone: '9876543212',
        email: 'amit@example.com',
        password: hashedPassword,
        businessName: 'Gupta Construction',
        businessType: 'other',
        location: { type: 'Point', coordinates: [77.5946, 12.9716], city: 'Bangalore', address: 'Koramangala' },
        isVerified: true,
      },
    ]);
    console.log(`🏢 ${hirers.length} hirers created`);

    // --- Workers ---
    const workers = await Worker.insertMany([
      {
        name: 'Suresh Kumar',
        phone: '9988776601',
        email: 'suresh@example.com',
        password: hashedPassword,
        workerSegment: 'daily_gig',
        skills: ['electrician', 'plumbing', 'wiring'],
        location: { type: 'Point', coordinates: [77.2100, 28.6150], city: 'New Delhi', address: 'Karol Bagh' },
        dailyRate: 800,
        experience: '5 years in electrical and plumbing work',
        telegramChatId: '123456789',
        isVerified: true,
        rating: 4.5,
        totalJobs: 23,
      },
      {
        name: 'Ravi Singh',
        phone: '9988776602',
        email: 'ravi@example.com',
        password: hashedPassword,
        workerSegment: 'part_time',
        skills: ['cooking', 'cleaning', 'serving'],
        location: { type: 'Point', coordinates: [72.8800, 19.0770], city: 'Mumbai', address: 'Bandra' },
        dailyRate: 600,
        experience: '3 years restaurant work',
        telegramChatId: '987654321',
        isVerified: true,
        rating: 4.2,
        totalJobs: 15,
      },
      {
        name: 'Deepak Yadav',
        phone: '9988776603',
        email: 'deepak@example.com',
        password: hashedPassword,
        workerSegment: 'daily_gig',
        skills: ['construction', 'painting', 'masonry'],
        location: { type: 'Point', coordinates: [77.5950, 12.9720], city: 'Bangalore', address: 'HSR Layout' },
        dailyRate: 700,
        experience: '4 years construction labour',
        telegramChatId: '111222333',
        isVerified: true,
        rating: 4.0,
        totalJobs: 31,
      },
      {
        name: 'Anita Devi',
        phone: '9988776604',
        email: 'anita@example.com',
        password: hashedPassword,
        workerSegment: 'full_time',
        skills: ['cleaning', 'housekeeping', 'laundry'],
        location: { type: 'Point', coordinates: [77.2200, 28.6200], city: 'New Delhi', address: 'Rajouri Garden' },
        monthlyRate: 15000,
        experience: '2 years housekeeping',
        telegramChatId: '444555666',
        isVerified: true,
        rating: 4.8,
        totalJobs: 42,
      },
      {
        name: 'Vikram Tiwari',
        phone: '9988776605',
        email: 'vikram@example.com',
        password: hashedPassword,
        workerSegment: 'part_time',
        skills: ['delivery', 'driving', 'loading'],
        location: { type: 'Point', coordinates: [72.8700, 19.0800], city: 'Mumbai', address: 'Goregaon' },
        dailyRate: 650,
        experience: 'Student, part-time delivery',
        telegramChatId: '777888999',
        isVerified: false,
        rating: 3.8,
        totalJobs: 8,
        registrationMethod: 'telegram_voice',
      },
    ]);
    console.log(`👷 ${workers.length} workers created`);

    // --- Sample Gigs ---
    const gigs = await GigJob.create([
      {
        hirerId: hirers[0]._id,
        hireType: 'daily_gig',
        title: 'Electrician needed for shop rewiring',
        description: 'Need an experienced electrician to rewire entire shop. MCB fitting + LED installation.',
        skillsRequired: ['electrician', 'wiring'],
        payPerDay: 900,
        duration: 3,
        totalPay: 2700,
        platformFee: 216,
        location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Connaught Place', city: 'New Delhi' },
        startDate: new Date('2026-03-15'),
      },
      {
        hirerId: hirers[1]._id,
        hireType: 'part_time',
        title: 'Restaurant helper for weekend rush',
        description: 'Need helping hands for weekend serving and cleaning. Friday to Sunday.',
        skillsRequired: ['cooking', 'serving', 'cleaning'],
        payPerDay: 600,
        daysPerWeek: 3,
        totalPay: 1800,
        platformFee: 144,
        location: { type: 'Point', coordinates: [72.8777, 19.0760], address: 'Andheri West', city: 'Mumbai' },
        startDate: new Date('2026-03-14'),
      },
      {
        hirerId: hirers[2]._id,
        hireType: 'full_time',
        title: 'Painter for 2BHK apartment',
        description: 'Interior painting for 2BHK apartment. Asian Paints provided. Need experienced painter.',
        skillsRequired: ['painting'],
        monthlyRate: 20000,
        platformFee: 20000,
        location: { type: 'Point', coordinates: [77.5946, 12.9716], address: 'Koramangala', city: 'Bangalore' },
        startDate: new Date('2026-03-12'),
      },
    ]);
    console.log(`📋 ${gigs.length} gigs created`);

    // --- Sample Applications ---
    const applications = await Application.create([
      {
        gigId: gigs[0]._id, // Electrician gig (daily)
        workerId: workers[0]._id, // Suresh
        applicationMethod: 'ai_matched',
        matchScore: 85,
        status: 'matched'
      },
      {
        gigId: gigs[1]._id, // Restaurant helper (part time)
        workerId: workers[1]._id, // Ravi
        applicationMethod: 'self_applied',
        coverNote: 'I have 3 years experience serving in Mumbai cafes.',
        status: 'applied'
      },
      {
        gigId: gigs[1]._id, // Restaurant helper (part time)
        workerId: workers[3]._id, // Anita (cleaning skills)
        applicationMethod: 'self_applied',
        coverNote: 'Can handle cleaning during the weekend rush.',
        status: 'applied'
      }
    ]);
    console.log(`📄 ${applications.length} applications created`);

    // --- Sample Reviews ---
    // Make gig[2] completed so we can add a review to it
    await GigJob.findByIdAndUpdate(gigs[2]._id, { status: 'completed', hiredWorkerId: workers[2]._id });

    const reviews = await Review.create([
      {
        gigId: gigs[2]._id,
        reviewerId: hirers[2]._id,
        reviewerRole: 'hirer',
        revieweeId: workers[2]._id,
        revieweeRole: 'worker',
        rating: 4,
        comment: 'Deepak did a great job with the painting. Very professional.'
      },
      {
        gigId: gigs[2]._id,
        reviewerId: workers[2]._id,
        reviewerRole: 'worker',
        revieweeId: hirers[2]._id,
        revieweeRole: 'hirer',
        rating: 5,
        comment: 'Clear instructions and paid on time via KaamSetu escrow.'
      }
    ]);
    console.log(`⭐ ${reviews.length} reviews created`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n--- Login Credentials ---');
    console.log('Hirer:  9876543210 / password123');
    console.log('Worker: 9988776601 / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
