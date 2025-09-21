const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Debugging: check if .env is loading
console.log("Loaded ENV:");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ Not set");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Not set");

let otpStore = {};

// Route: Home
app.get('/', (req, res) => {
  res.send('OTP Backend is running ✅');
});

// Route: Send OTP
app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  console.log(`Generated OTP for ${email}: ${otp}`);

  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your gmail
        pass: process.env.EMAIL_PASS  // 16-char app password
      }
    });

    let info = await transporter.sendMail({
      from: `"LevelUp Fit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
      html: `<h2>Your OTP is: ${otp}</h2>`
    });

    console.log("Email sent:", info.response);
    res.json({ success: true, message: "OTP sent to your email" });

  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
  }
});

// Route: Verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP required" });

  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    return res.json({ success: true, message: "OTP verified successfully" });
  }

  return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
