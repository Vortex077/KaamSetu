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

const sendHiringEmail = async (worker, gig, hirer) => {
  if (!worker.email || !process.env.EMAIL_USER) {
    console.warn("Skipping hiring email, missing email address or credentials.");
    return;
  }

  const acceptLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/gigs/${gig._id}/accept-via-email?workerId=${worker._id}`;

  try {
    await transporter.sendMail({
      from: `"KaamSetu" <${process.env.EMAIL_USER}>`,
      to: worker.email,
      subject: `New Job Opportunity: ${gig.title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #FF6B35;">Congratulations!</h2>
          <p>You have been selected for a job by <strong>${hirer.businessName || hirer.name}</strong>.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${gig.title}</h3>
            <p><strong>Type:</strong> ${gig.hireType.replace('_', ' ')}</p>
            <p><strong>Pay:</strong> ₹${gig.monthlyRate || gig.payPerDay}/period</p>
            <p><strong>Location:</strong> ${gig.location?.address || 'View on app'}</p>
          </div>

          <p>Payment for this job is already secured in KaamSetu Escrow. Please accept the work to reveal hirer contact details.</p>
          
          <a href="${acceptLink}" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Accept Work</a>
          
          <p style="font-size: 12px; color: #888; margin-top: 30px;">
            This link is valid for 2 hours.
          </p>
        </div>
      `
    });
    console.log(`[EmailService] Hiring email sent to ${worker.email}`);
  } catch (err) {
    console.error("Failed to send hiring email", err);
  }
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

module.exports = { sendOTP, generateOTP, sendHiringEmail };
