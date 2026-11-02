/**
 * Vercel Serverless Function: /api/admin/verify-otp
 * Validates the submitted 6-digit OTP against kiran@ojix.in within 5 minutes.
 */
'use strict';

require('dotenv').config();
try {
  require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local'), override: true });
} catch (_) {}

const crypto = require('crypto');
const { challenges, sha256 } = require('./otp-store');

const TARGET_ADMIN = process.env.CONTACT_RECEIVER || 'kiran@ojix.in';
const SESSION_HOURS = 8;

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  const { challenge = '', code = '', otp = '' } = req.body || {};
  const submittedCode = String(code || otp).trim();

  if (!challenge) {
    return res.status(400).json({ success: false, error: 'Challenge identifier is required.' });
  }

  const c = challenges.get(String(challenge));
  if (!c) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session. Please request a new code.' });
  }

  if (c.expiresAt < Date.now()) {
    challenges.delete(challenge);
    return res.status(401).json({ success: false, error: 'Verification code expired (5-minute limit). Please sign in again.' });
  }

  c.attempts = (c.attempts || 0) + 1;
  if (c.attempts > 5) {
    challenges.delete(challenge);
    return res.status(429).json({ success: false, error: 'Too many incorrect attempts. Please request a new code.' });
  }

  const submittedHash = sha256(submittedCode);
  const isMatch = crypto.timingSafeEqual(Buffer.from(submittedHash), Buffer.from(c.hash));

  if (!isMatch) {
    return res.status(401).json({ success: false, error: 'Incorrect verification code.' });
  }

  // Valid OTP! Teardown challenge and issue token
  challenges.delete(challenge);

  const token = crypto.randomBytes(32).toString('hex');
  const isProd = process.env.NODE_ENV === 'production';

  res.setHeader('Set-Cookie', `ojx_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${isProd ? '; Secure' : ''}`);

  return res.status(200).json({
    success: true,
    authorized: true,
    user: TARGET_ADMIN,
    token
  });
};

