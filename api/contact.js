/**
 * Vercel Serverless Function: /api/contact
 * Routes customer submissions directly to kiran@ojix.in using Google Workspace SMTP via Nodemailer.
 */
'use strict';

require('dotenv').config();
try {
  require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local'), override: true });
} catch (_) {}

const nodemailer = require('nodemailer');
const db = require('../db');

const SMTP_USER = process.env.SMTP_USER || 'kiran@ojix.in';
const SMTP_PASS = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').replace(/\s+/g, '');
const TARGET_RECIPIENT = process.env.CONTACT_RECEIVER || SMTP_USER;

// Reusable Google Workspace SMTP Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

function esc(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const body = req.body || {};
  const name = String(body.name || body.full_name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const company = String(body.company || body.organization || '').trim();
  const service = String(body.service || body.interested_in || body.interest || body.interestedIn || 'General Requirement').trim();
  const message = String(body.message || body.requirement || '').trim();
  const consent = Boolean(body.consent || body.consent_agreed || body.consentAgreed);

  // Honeypot check
  if (body._hp_check) {
    return res.status(200).json({ success: true, message: 'Inquiry received.' });
  }

  // Basic validation
  if (!name) {
    return res.status(400).json({ success: false, error: 'Please enter your name.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  const refId = 'OJX-' + Date.now().toString(36).toUpperCase();

  // 1. Record lead to database if available
  try {
    if (db && typeof db.query === 'function') {
      await db.query(
        `INSERT INTO contact_leads (full_name, email, phone, company, interested_in, requirement, consent_agreed)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [name, email, phone || null, company || null, service, message || null, consent]
      );
    }
  } catch (dbErr) {
    console.warn('[Contact DB Insert]:', dbErr.message);
  }

  // Record to sovereign local store if available
  try {
    if (db && typeof db.recordInquiry === 'function') {
      db.recordInquiry({
        name,
        email,
        organization: company,
        interest: service,
        message: [phone ? 'Phone: ' + phone : '', message].filter(Boolean).join('\n'),
        ip: req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '',
        userAgent: req.headers['user-agent'] || ''
      });
    }
  } catch (storeErr) {
    console.warn('[Contact Local Store]:', storeErr.message);
  }

  // 2. Dispatch Branded HTML Email to kiran@ojix.in
  const htmlNotification = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New OJIX Requirement</title>
</head>
<body style="margin:0;padding:24px;background:#09121E;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#F8FAFC;">
  <div style="max-width:560px;margin:0 auto;background:#0F1C2E;border:1px solid #1e293b;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.4);">
    <div style="background:#09121E;padding:24px 28px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between;">
      <h2 style="margin:0;font-size:20px;color:#F39C6B;font-weight:700;letter-spacing:-0.01em;">OJIX · New Requirement</h2>
      <span style="font-size:12px;color:#94A3B8;font-family:monospace;">${refId}</span>
    </div>
    <div style="padding:28px;">
      <p style="margin:0 0 20px 0;font-size:15px;color:#CBD5E1;line-height:1.5;">
        A new client requirement has been submitted through the OJIX website.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 0;color:#94A3B8;font-size:13px;width:120px;border-bottom:1px solid rgba(255,255,255,0.06);">Name</td>
          <td style="padding:10px 0;color:#F8FAFC;font-size:14px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.06);">${esc(name)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06);">Email</td>
          <td style="padding:10px 0;color:#F8FAFC;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.06);"><a href="mailto:${esc(email)}" style="color:#F39C6B;text-decoration:none;">${esc(email)}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06);">Phone</td>
          <td style="padding:10px 0;color:#F8FAFC;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.06);">${esc(phone || '—')}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06);">Company</td>
          <td style="padding:10px 0;color:#F8FAFC;font-size:14px;border-bottom:1px solid rgba(255,255,255,0.06);">${esc(company || '—')}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#94A3B8;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06);">Service / Topic</td>
          <td style="padding:10px 0;color:#F8FAFC;font-size:14px;font-weight:600;border-bottom:1px solid rgba(255,255,255,0.06);">${esc(service)}</td>
        </tr>
      </table>
      
      <div style="background:#09121E;border:1px solid #1e293b;border-radius:12px;padding:16px 18px;margin-bottom:24px;">
        <span style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#F39C6B;margin-bottom:8px;">Requirement Details</span>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#CBD5E1;white-space:pre-wrap;">${esc(message || 'No additional note provided.')}</p>
      </div>

      <p style="margin:0;font-size:12px;color:#94A3B8;">
        Reply to this email directly to correspond with <strong>${esc(name)}</strong>.
      </p>
    </div>
    <div style="background:#09121E;padding:16px 28px;border-top:1px solid #1e293b;text-align:center;font-size:12px;color:#64748B;">
      OJIX Engineering &amp; Technology LLP · Dedicated Inbound Router
    </div>
  </div>
</body>
</html>
`;

  try {
    if (SMTP_USER && SMTP_PASS) {
      try {
        await transporter.sendMail({
          from: `"OJIX Inbound" <${SMTP_USER}>`,
          to: TARGET_RECIPIENT,
          replyTo: email,
          subject: `New Requirement: ${name}${company ? ' · ' + company : ''}`,
          text: `New requirement from ${name} (${email}):\n\nService: ${service}\nPhone: ${phone}\nCompany: ${company}\nMessage:\n${message}\n\nRef: ${refId}`,
          html: htmlNotification
        });

        // Optional: Client acknowledgement note
        try {
          await transporter.sendMail({
            from: `"OJIX" <${SMTP_USER}>`,
            to: email,
            replyTo: TARGET_RECIPIENT,
            subject: 'We’ve received your requirement — OJIX',
            text: `Hi ${name},\n\nThank you for reaching out to OJIX. We have received your requirement for ${service}.\n\nOur solutions team will review the details and get back to you shortly—usually within one business day.\n\nReference: ${refId}\n\nWarm regards,\nTeam OJIX\nhttps://ojix.in`
          });
        } catch (ackErr) {
          console.warn('[Contact Client Ack Warning]:', ackErr.message);
        }
      } catch (mailErr) {
        console.warn('[Contact Mail Dispatch Error]:', mailErr.message);
      }
    } else {
      console.warn('[Contact] SMTP credentials not fully configured; recorded lead without email dispatch.');
    }

    return res.status(200).json({
      success: true,
      referenceId: refId,
      message: 'Thank you. We have received your requirement and will contact you shortly.'
    });
  } catch (err) {
    console.error('[POST /api/contact Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || ('Failed to dispatch requirement. Please try again or email us directly at ' + TARGET_RECIPIENT)
    });
  }
};

module.exports.transporter = transporter;
