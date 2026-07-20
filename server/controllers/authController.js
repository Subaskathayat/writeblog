import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { cleanText } from '../utils/sanitize.js';
import { hashToken } from '../utils/tokens.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

const publicUser = (u) => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  bio: u.bio,
  avatar: u.avatar,
  role: u.role,
  isVerified: u.isVerified,
  createdAt: u.createdAt,
});

// Generic message reused for account-enumeration-safe responses.
const GENERIC_RESET_MSG =
  'If an account with that email exists, a password reset link has been sent.';

// POST /api/auth/signup
export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({ message: 'An account with that email already exists' });
  }
  const user = await User.create({
    username: cleanText(username),
    email,
    password,
  });

  const rawToken = user.createVerificationToken();
  await user.save();
  await sendVerificationEmail(user, rawToken);

  res.status(201).json({
    message: 'Account created. Check your email to verify your account before logging in.',
    email: user.email,
  });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (!user.isVerified) {
    return res.status(403).json({
      message: 'Please verify your email before logging in.',
      needsVerification: true,
      email: user.email,
    });
  }
  res.json({ token: generateToken(user._id), user: publicUser(user) });
};

// POST /api/auth/verify-email  { token }
export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  const user = await User.findOne({
    verificationToken: hashToken(token),
    verificationExpires: { $gt: new Date() },
  }).select('+verificationToken +verificationExpires');

  if (!user) {
    return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save();

  // Log the user in on successful verification.
  res.json({ token: generateToken(user._id), user: publicUser(user) });
};

// POST /api/auth/resend-verification  { email }
export const resendVerification = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Only send if the account exists and is not yet verified; response is generic.
  if (user && !user.isVerified) {
    const rawToken = user.createVerificationToken();
    await user.save();
    await sendVerificationEmail(user, rawToken);
  }

  res.json({
    message: 'If your account needs verification, a new link has been sent to your email.',
  });
};

// POST /api/auth/forgot-password  { email }
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    const rawToken = user.createPasswordResetToken();
    await user.save();
    await sendPasswordResetEmail(user, rawToken);
  }

  // Always the same response to prevent account enumeration.
  res.json({ message: GENERIC_RESET_MSG });
};

// POST /api/auth/reset-password  { token, password }
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: hashToken(token),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    return res.status(400).json({ message: 'Reset link is invalid or has expired.' });
  }

  user.password = password; // pre-save hook re-hashes with bcrypt
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // A successful reset also proves email ownership.
  user.isVerified = true;
  await user.save();

  res.json({ message: 'Password reset successful. You can now log in.' });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  const user = req.user;
  const { username, bio, avatar, password } = req.body;
  if (username !== undefined) user.username = cleanText(username);
  if (bio !== undefined) user.bio = cleanText(bio);
  if (avatar !== undefined) user.avatar = avatar.trim();
  if (password) user.password = password;
  await user.save();
  res.json({ user: publicUser(user) });
};
