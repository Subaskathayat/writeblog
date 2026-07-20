import crypto from 'node:crypto';

// A raw token is sent to the user (via email link); only its SHA-256 hash is
// stored in the database, so a leaked DB cannot be used to verify/reset.
export const generateRawToken = () => crypto.randomBytes(32).toString('hex');

export const hashToken = (raw) =>
  crypto.createHash('sha256').update(raw).digest('hex');
