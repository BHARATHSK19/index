/**
 * Vercel Serverless Function: /api/admin/otp
 * Dispatches Admin 2FA One-Time Passcodes via Google Workspace SMTP
 */
'use strict';

require('dotenv').config();
try {
  require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local'), override: true });
} catch (_) {}
const nodemailer = require('nodemailer');
const mailer = require('../../mailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').replace(/\s+/g, '')
  }
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { otp } = req.body || {};
  if (!otp) {
    return res.status(400).json({ success: false, error: 'OTP is required.' });
  }

  try {
    const result = await mailer.sendAdminOTP(otp);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('[API Admin OTP Error]:', err);
    return res.status(500).json({ success: false, error: 'Failed to send OTP.' });
  }
};

module.exports.transporter = transporter;

