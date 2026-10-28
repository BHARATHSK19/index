/**
 * OJIX — Transactional & Security Mailer (v1.1.0)
 * Handles Google Workspace SMTP dispatch for:
 *   - Admin 2FA One-Time Passcodes (sendAdminOTP)
 *   - Subscriber Welcome Notes (sendWelcome)
 *   - Customer Project Inquiries & Notifications (sendEnquiryMails)
 */

'use strict';

require('dotenv').config();
const nodemailer = require('nodemailer');

// 1. REUSABLE SMTP TRANSPORTER (Google Workspace / Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').replace(/\s+/g, '')
  }
});

const SITE = process.env.SITE_URL || 'https://ojix.in';

/**
 * Escapes HTML characters in user input to prevent email injection / XSS
 */
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

/**
 * Dispatches Admin 2FA verification code via high-contrast security email card.
 * @param {string|number} otp 6-digit verification code
 * @returns {Promise<object>} nodemailer send info
 */
async function sendAdminOTP(otp) {
  const fromUser = process.env.SMTP_USER || 'info@ojix.in';
  const toEmail = process.env.ADMIN_OTP_EMAIL || 'info@ojix.in';
  const subject = `OJIX Admin 2FA Verification Code: ${otp}`;

  const text = [
    'OJIX SECURITY · TWO-FACTOR AUTHENTICATION',
    '=========================================',
    '',
    `Your Admin 2FA Verification Code: ${otp}`,
    '',
    '⏱ This verification code is valid for 10 minutes only.',
    '',
    'SECURITY NOTICE:',
    'If you did not initiate this sign-in attempt, your administrative credentials',
    'may be compromised. Secure your account immediately and contact SecOps.',
    '',
    '— OJIX Security Operations',
    'OJIX Engineering & Technology LLP · Bengaluru, India',
    SITE
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:32px 16px;background-color:#070d14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f0f3f6;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;margin:0 auto;background-color:#0f1c2e;border:1px solid #1f334d;border-radius:12px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,0.5);">
    
    <!-- Top Brand Security Header -->
    <tr>
      <td style="padding:28px 32px;background:linear-gradient(135deg, #0f1c2e 0%, #15273d 100%);border-bottom:1px solid rgba(255,255,255,0.08);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <span style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#C9662F;">OJIX SECURITY</span>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Admin 2FA Verification</h1>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Card Body -->
    <tr>
      <td style="padding:32px 32px 24px;">
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#cbd5e1;">
          A privileged sign-in request was received for the <strong>OJIX Admin Console</strong>. Use the 6-digit verification code below to authorize access:
        </p>

        <!-- High-Contrast OTP Code Box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
          <tr>
            <td style="background-color:#050a12;border:1px solid #C9662F;border-radius:8px;padding:24px;text-align:center;">
              <div style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#94a3b8;margin-bottom:8px;">
                One-Time Security Passcode
              </div>
              <div style="font-size:42px;font-weight:800;letter-spacing:10px;color:#ffffff;font-family:'SF Mono',Consolas,Menlo,'Courier New',monospace;padding-left:10px;">
                ${esc(otp)}
              </div>
            </td>
          </tr>
        </table>

        <!-- 10-Minute Expiration Notice -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;background-color:rgba(201,102,47,0.12);border-left:4px solid #C9662F;border-radius:4px;">
          <tr>
            <td style="padding:12px 16px;">
              <p style="margin:0;font-size:13px;line-height:1.5;color:#f8fafc;">
                <strong>⏱ Notice:</strong> This code is single-use and will strictly expire in <strong>10 minutes</strong>.
              </p>
            </td>
          </tr>
        </table>

        <!-- Critical Security Warning -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;">
          <tr>
            <td style="padding:14px 16px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#fbbf24;">
                Security Warning
              </p>
              <p style="margin:0;font-size:12px;line-height:1.55;color:#94a3b8;">
                If you did not initiate this authentication request, someone may know your admin password. Immediately revoke active sessions, change your credentials, and inform the security team.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 32px 28px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;color:#64748b;">
          OJIX Engineering &amp; Technology LLP · Bengaluru, India
        </p>
        <p style="margin:0;font-size:11px;color:#475569;">
          Statutory Security Notice · Automated Dispatch via Google Workspace SMTP
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return await transporter.sendMail({
    from: `"OJIX Security" <${fromUser}>`,
    to: toEmail,
    subject,
    text,
    html
  });
}

/**
 * Backward compatibility alias for sendAdminOTP
 */
async function sendOtp(to, code) {
  return await sendAdminOTP(code);
}

// ---------------------------------------------------------------- Newsletter Welcome Email
function welcomeText() {
  return [
    'Hi,',
    '',
    'Welcome to OJIX.',
    '',
    'Thanks for subscribing. We build business software for Indian teams —',
    'Company Management System, Nyaya Sethu, ProcureOS, School ERP, University Management System, AI Proctoring, Construction Hub, Property Intelligence, TravelOS, FitOS and the',
    'DPDP Privacy Vault — and we write only when there is something worth reading:',
    'product updates, build notes and lessons from real operations.',
    '',
    'No spam. Never more often than we would want to read ourselves.',
    '',
    'If you did not sign up, just reply "unsubscribe" and we will remove your address.',
    '',
    '— Team OJIX',
    'OJIX Engineering & Technology LLP · Bengaluru',
    SITE
  ].join('\n');
}

function welcomeHtml() {
  const p = 'margin:0 0 18px;font-size:16px;line-height:1.6;color:#1d1d1f;';
  return `<!doctype html><html><body style="margin:0;padding:40px 24px;background:#ffffff;">
<div style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;">
<p style="margin:0 0 36px;font-size:13px;letter-spacing:0.12em;color:#C9662F;font-weight:600;">OJIX</p>
<p style="${p}">Hi,</p>
<p style="margin:0 0 18px;font-size:28px;line-height:1.2;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">Welcome to OJIX.</p>
<p style="${p}">Thanks for subscribing. We build business software for Indian teams — Company Management System, Nyaya Sethu, ProcureOS, School ERP, University Management System, AI Proctoring, Construction Hub, Property Intelligence, TravelOS, FitOS and the DPDP Privacy Vault — and we write only when there is something worth reading: product updates, build notes and lessons from real operations.</p>
<p style="${p}">No spam. Never more often than we would want to read ourselves.</p>
<p style="${p}color:#6e6e73;">If you did not sign up, just reply “unsubscribe” and we will remove your address.</p>
<p style="margin:36px 0 4px;font-size:15px;color:#1d1d1f;">— Team OJIX</p>
<p style="margin:0;font-size:13px;color:#8e8e93;">OJIX Engineering &amp; Technology LLP · Bengaluru · <a href="${SITE}" style="color:#8e8e93;">${SITE.replace(/^https?:\/\//, '')}</a></p>
</div></body></html>`;
}

async function sendWelcome(to) {
  if (!isConfigured()) return { sent: false, reason: 'not-configured' };
  const fromName = process.env.SMTP_FROM_NAME || 'OJIX';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from: `"${fromName}" <${from}>`,
    to,
    replyTo: from,
    subject: 'Welcome to OJIX',
    text: welcomeText(),
    html: welcomeHtml()
  });
  return { sent: true };
}

// ---------------------------------------------------------------- Project Enquiries
function plainMail(title, paras, footNote) {
  const p = 'margin:0 0 18px;font-size:16px;line-height:1.6;color:#1d1d1f;';
  return `<!doctype html><html><body style="margin:0;padding:40px 24px;background:#ffffff;">
<div style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Helvetica,Arial,sans-serif;">
<p style="margin:0 0 36px;font-size:13px;letter-spacing:0.12em;color:#C9662F;font-weight:600;">OJIX</p>
<p style="margin:0 0 18px;font-size:28px;line-height:1.2;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">${esc(title)}</p>
${paras.map((x) => `<p style="${p}">${x}</p>`).join('\n')}
${footNote ? `<p style="${p}color:#6e6e73;">${footNote}</p>` : ''}
<p style="margin:36px 0 4px;font-size:15px;color:#1d1d1f;">— Team OJIX</p>
<p style="margin:0;font-size:13px;color:#8e8e93;">OJIX Engineering &amp; Technology LLP · Bengaluru · <a href="${SITE}" style="color:#8e8e93;">${SITE.replace(/^https?:\/\//, '')}</a></p>
</div></body></html>`;
}

async function sendEnquiryMails(d) {
  if (!isConfigured()) return { sent: false, reason: 'not-configured' };
  const fromName = process.env.SMTP_FROM_NAME || 'OJIX';
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const first = esc(String(d.name || '').split(' ')[0] || 'there');

  // 1. Welcome to prospect
  await transporter.sendMail({
    from: `"${fromName}" <${from}>`,
    to: d.email,
    replyTo: from,
    subject: 'Welcome to OJIX',
    text: `Hi ${d.name},\n\nWelcome to OJIX.\n\nWe build business software for Indian teams — Company Management System, Nyaya Sethu, ProcureOS, School ERP, University Management System, AI Proctoring, Construction Hub, Property Intelligence, TravelOS, FitOS and the DPDP Privacy Vault — designed around how your people already work.\n\nThanks for reaching out. A separate note confirms we have your requirement.\n\n— Team OJIX\nOJIX Engineering & Technology LLP · Bengaluru\n${SITE}`,
    html: plainMail('Welcome to OJIX.', [
      `Hi ${first},`,
      'We build business software for Indian teams — Company Management System, Nyaya Sethu, ProcureOS, School ERP, University Management System, AI Proctoring, Construction Hub, Property Intelligence, TravelOS, FitOS and the DPDP Privacy Vault — designed around how your people already work.',
      'Thanks for reaching out. A separate note confirms we have your requirement.'
    ])
  });

  // 2. Requirement confirmation
  const rows = [['Interested in', d.interest], ['Company', d.organization], ['Phone', d.phone], ['Your note', d.message]]
    .filter((r) => r[1]);
  await transporter.sendMail({
    from: `"${fromName}" <${from}>`,
    to: d.email,
    replyTo: from,
    subject: 'We’ve received your requirement',
    text: `Hi ${d.name},\n\nWe’ve received your requirement. Our team will get in touch with you shortly — usually within one working day.\n\n${rows.map((r) => `${r[0]}: ${r[1]}`).join('\n')}\n\nReference: ${d.referenceId || '—'}\n\nNeed to add something? Just reply to this email.\n\n— Team OJIX`,
    html: plainMail('We’ve received your requirement.', [
      `Hi ${first},`,
      'Our team will get in touch with you shortly — usually within one working day.',
      rows.map((r) => `<span style="color:#6e6e73;">${esc(r[0])}:</span> ${esc(r[1])}`).join('<br>'),
      `<span style="color:#6e6e73;">Reference:</span> ${esc(d.referenceId || '—')}`
    ], 'Need to add something? Just reply to this email.')
  });

  // 3. Team notification
  const team = process.env.ENQUIRY_NOTIFY_EMAIL || from;
  await transporter.sendMail({
    from: `"OJIX website" <${from}>`,
    to: team,
    replyTo: d.email,
    subject: `New project enquiry — ${d.name}${d.organization ? ' (' + d.organization + ')' : ''}`,
    text: [`Name: ${d.name}`, `Email: ${d.email}`].concat(rows.map((r) => `${r[0]}: ${r[1]}`)).concat([`Reference: ${d.referenceId || '—'}`, '', 'Reply to this email to answer them directly.']).join('\n')
  });

  return { sent: true };
}

// ---------------------------------------------------------------- Utilities
async function verify() {
  return await transporter.verify();
}

function isConfigured() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  return Boolean(host && user && pass);
}

module.exports = {
  transporter,
  sendAdminOTP,
  sendWelcome,
  sendOtp,
  sendEnquiryMails,
  verify,
  isConfigured,
  welcomeText,
  welcomeHtml
};
