import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { generateRawToken, hashToken } from '../utils/tokens.js';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [2, 'Username must be at least 2 characters'],
      maxlength: [40, 'Username must be at most 40 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    bio: { type: String, default: '', maxlength: 500 },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Create a one-time token: store the hash + expiry on the document, return the
// raw token to email to the user. Caller is responsible for saving.
userSchema.methods.createVerificationToken = function () {
  const raw = generateRawToken();
  this.verificationToken = hashToken(raw);
  this.verificationExpires = new Date(Date.now() + VERIFICATION_TTL_MS);
  return raw;
};

userSchema.methods.createPasswordResetToken = function () {
  const raw = generateRawToken();
  this.resetPasswordToken = hashToken(raw);
  this.resetPasswordExpires = new Date(Date.now() + RESET_TTL_MS);
  return raw;
};

const User = mongoose.model('User', userSchema);
export default User;
