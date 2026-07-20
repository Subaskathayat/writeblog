import express from 'express';
import { body } from 'express-validator';
import {
  signup,
  login,
  getMe,
  updateProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  sensitiveLimiter,
  loginLimiter,
  signupLimiter,
  refreshLimiter,
} from '../middleware/rateLimit.js';

const router = express.Router();

router.post(
  '/signup',
  signupLimiter,
  [
    body('username').trim().isLength({ min: 2, max: 40 }).withMessage('Username must be 2-40 characters'),
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  signup
);

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/verify-email',
  [body('token').notEmpty().withMessage('Verification token is required')],
  validate,
  verifyEmail
);

router.post(
  '/resend-verification',
  sensitiveLimiter,
  [body('email').isEmail().withMessage('A valid email is required').normalizeEmail()],
  validate,
  resendVerification
);

router.post(
  '/forgot-password',
  sensitiveLimiter,
  [body('email').isEmail().withMessage('A valid email is required').normalizeEmail()],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  sensitiveLimiter,
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  resetPassword
);

router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
