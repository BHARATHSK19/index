/**
 * Shared in-memory challenge store for Admin 2FA OTPs
 */
'use strict';

const crypto = require('crypto');

// Map: challengeId -> { email, hash, expiresAt, attempts }
const challenges = new Map();

function sha256(val) {
  return crypto.createHash('sha256').update(String(val)).digest('hex');
}

module.exports = {
  challenges,
  sha256
};

