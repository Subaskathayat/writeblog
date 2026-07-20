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

// Signup: prevent automated account creation / email flooding.
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

// Refresh runs often (every ~15 min per active client), so allow a higher ceiling
// while still blocking abuse.
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});
