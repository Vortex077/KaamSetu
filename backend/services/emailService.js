const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTP = async (email, otp) => {
  if (!email || !process.env.EMAIL_USER) {
    console.warn("Skipping email OTP, missing credentials or email address.");
    return;
  }
  
  try {
    await transporter.sendMail({
      from:    `"KaamSetu" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'KaamSetu — Email Verification OTP',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px">
          <h2 style="color:#1E3A5F">KaamSetu</h2>
          <p>Your verification code is:</p>
          <h1 style="color:#FF6B35;letter-spacing:8px">${otp}</h1>
          <p style="color:#888">Valid for 10 minutes</p>
        </div>
      `
    });
  } catch(e) {
    console.error("Failed to send OTP", e);
  }
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

module.exports = { sendOTP, generateOTP };
