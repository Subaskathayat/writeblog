import RefreshToken from '../models/RefreshToken.js';
import { generateRefreshToken } from './generateToken.js';
import { hashToken } from './tokens.js';

export const REFRESH_COOKIE = 'refreshToken';
export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const isProd = () => process.env.NODE_ENV === 'production';

// Cookie is scoped to the auth routes so it is only sent where it's needed.
const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd(),
  // Cross-site (Vercel client ↔ Render API) needs SameSite=None; local dev uses Lax.
  sameSite: isProd() ? 'none' : 'lax',
  path: '/api/auth',
});

// Persist a hashed refresh token for the user and set the raw token as an
// HttpOnly cookie on the response.
export const issueRefreshToken = async (res, user) => {
  const raw = generateRefreshToken();
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
  res.cookie(REFRESH_COOKIE, raw, { ...cookieOptions(), maxAge: REFRESH_TTL_MS });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE, cookieOptions());
};
