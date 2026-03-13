const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');
const Hirer = require('../models/Hirer');
const { sendOTP, generateOTP } = require('../services/emailService');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { role, name, phone, email, password, workerSegment, businessName, businessType, location, skills, dailyRate, monthlyRate } = req.body;

    if (!role || !['worker', 'hirer'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Valid role is required' });
    }

    const Model = role === 'worker' ? Worker : Hirer;
    let user = await Model.findOne({ phone });
    if (user) return res.status(400).json({ success: false, error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    if (role === 'worker') {
      newUser = new Worker({
        name, phone, email, password: hashedPassword, role: 'worker',
        workerSegment: workerSegment || 'daily_gig',
        skills: skills || [],
        dailyRate: dailyRate || 0,
        monthlyRate: monthlyRate || 0,
        registrationMethod: 'web',
        location: location || { type: 'Point', coordinates: [0, 0] }
      });
    } else {
      newUser = new Hirer({
        name, phone, email, password: hashedPassword, role: 'hirer',
        businessName, businessType,
        location: location || { type: 'Point', coordinates: [0, 0] }
      });
    }

    await newUser.save();

    const payload = { userId: newUser._id, role: newUser.role, workerSegment: newUser.workerSegment };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ success: true, token, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { role, phone, password } = req.body;
    
    if (!role || !phone || !password) {
      return res.status(400).json({ success: false, error: 'Please enter all fields' });
    }

    const Model = role === 'worker' ? Worker : Hirer;
    const user = await Model.findOne({ phone });

    if (!user || !user.password) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid credentials' });

    const payload = { userId: user._id, role: user.role, workerSegment: user.workerSegment };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email, role, phone } = req.body;
    if (!email || !role || !phone) {
       return res.status(400).json({ success: false, error: 'Missing email, role, or phone' });
    }
    
    const Model = role === 'worker' ? Worker : Hirer;
    const user = await Model.findOne({ phone, email });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const otp = generateOTP();
    user.emailOTP = otp;
    user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    await sendOTP(email, otp);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
      const { email, role, otp } = req.body;
      const Model = role === 'worker' ? Worker : Hirer;
      const user = await Model.findOne({ email });
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      
      if (user.emailOTP !== otp) {
          return res.status(400).json({ success: false, error: 'Invalid OTP' });
      }
      if (new Date() > user.emailOTPExpiry) {
          return res.status(400).json({ success: false, error: 'OTP has expired' });
      }

      user.isEmailVerified = true;
      user.emailOTP = null;
      user.emailOTPExpiry = null;
      await user.save();

      res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
