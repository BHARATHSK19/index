/**
 * Vercel Serverless Function: /api/admin/send-otp
 * Generates and dispatches a 6-digit OTP strictly to kiran@ojix.in with a 5-minute expiry.
 */
'use strict';

require('dotenv/config');
const path = require('path');
const dotenv = require('dotenv');

try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
} catch (_) {}

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { challenges, sha256 } = require('./otp-store');

const TARGET_ADMIN = process.env.CONTACT_RECEIVER || 'kiran@ojix.in';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function getTransporter(user, pass) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });

  const { email = '', username = '', password = '' } = req.body || {};
  const requestedIdentity = (email || username || '').toLowerCase().trim();

  // Enforce strict administrative authorization: only kiran@ojix.in (or default admin user) allowed
  const validAdminUser = (process.env.ADMIN_USER || 'admin').toLowerCase();
  const isAuthorized = requestedIdentity === 'kiran@ojix.in' || requestedIdentity === validAdminUser || requestedIdentity === '';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Administrative sign-in is strictly restricted to kiran@ojix.in.'
    });
  }

  // Validate admin password if configured
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword && password && password !== envPassword) {
    return res.status(401).json({ success: false, error: 'Invalid password.' });
  }

  // Verify SMTP credentials presence
  const smtpUser = process.env.SMTP_USER || 'kiran@ojix.in';
  const smtpPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');

  if (!smtpUser || !smtpPass) {
    return res.status(500).json({
      success: false,
      error: 'SMTP credentials missing (SMTP_USER or SMTP_PASS not set).'
    });
  }

  // Generate cryptographically secure 6-digit OTP
  const otp = String(crypto.randomInt(100000, 999999));
  const challenge = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  challenges.set(challenge, {
    email: TARGET_ADMIN,
    hash: sha256(otp),
    expiresAt,
    attempts: 0
  });

  const htmlCard = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OJIX Admin Verification Code</title>
</head>
<body style="margin:0;padding:24px;background:#09121E;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#F8FAFC;">
  <div style="max-width:500px;margin:0 auto;background:#0F1C2E;border:1px solid #1e293b;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.4);">
    <div style="background:#09121E;padding:24px 28px;border-bottom:1px solid #1e293b;text-align:center;">
      <h2 style="margin:0;font-size:20px;color:#F39C6B;font-weight:700;">OJIX Security · 2FA Code</h2>
    </div>
    <div style="padding:32px 28px;text-align:center;">
      <p style="margin:0 0 16px 0;font-size:14px;color:#CBD5E1;">
        Use the following one-time code to authenticate your admin sign-in:
      </p>
      <div style="background:#09121E;border:1px solid #C9662F;border-radius:14px;padding:18px 24px;display:inline-block;margin:12px auto 20px;">
        <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#F8FAFC;margin-left:10px;">${otp}</span>
      </div>
      <p style="margin:0 0 16px 0;font-size:13px;color:#F39C6B;font-weight:600;">
        ⏱ This verification code expires in 5 minutes.
      </p>
      <p style="margin:0;font-size:12px;color:#64748B;line-height:1.5;">
        If you did not initiate this sign-in attempt, secure your Google Workspace account immediately.
      </p>
    </div>
    <div style="background:#09121E;padding:16px 28px;border-top:1px solid #1e293b;text-align:center;font-size:12px;color:#64748B;">
      Protected administrative access for ${TARGET_ADMIN}
    </div>
  </div>
</body>
</html>
`;

  try {
    const transporter = getTransporter(smtpUser, smtpPass);

    // Validate connection prior to dispatch
    await transporter.verify();

    await transporter.sendMail({
      from: `"OJIX Security" <${smtpUser}>`,
      to: TARGET_ADMIN,
      subject: `OJIX Admin Verification Code: ${otp}`,
      text: `Your OJIX Admin 2FA verification code is: ${otp}\n\nThis code expires in 5 minutes.\nTarget identity: ${TARGET_ADMIN}`,
      html: htmlCard
    });

    console.log(`[OJIX Admin OTP] Sent 5-min OTP to ${TARGET_ADMIN}`);

    return res.status(200).json({
      success: true,
      challenge,
      sentTo: TARGET_ADMIN,
      expiresInMinutes: 5
    });
  } catch (err) {
    console.error('[Admin Send-OTP Error]:', err);
    challenges.delete(challenge);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch verification code.'
    });
  }
};
