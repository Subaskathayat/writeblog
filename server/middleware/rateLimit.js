import rateLimit from 'express-rate-limit';

const message = { message: 'Too many requests. Please try again in a little while.' };

// Tight limit for endpoints that trigger emails or password changes.
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

// Slightly looser limit for login attempts.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});
