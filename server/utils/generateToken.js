import jwt from 'jsonwebtoken';
import { generateRawToken } from './tokens.js';

// Short-lived access token (default 15 minutes). Payload stays `{ id }` so the
// `protect` middleware is unchanged.
export const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

// Opaque random refresh token. Only its hash is persisted (see RefreshToken model).
export const generateRefreshToken = () => generateRawToken();
