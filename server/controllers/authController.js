import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { cleanText } from '../utils/sanitize.js';

const publicUser = (u) => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  bio: u.bio,
  avatar: u.avatar,
  role: u.role,
  createdAt: u.createdAt,
});

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
  res.status(201).json({ token: generateToken(user._id), user: publicUser(user) });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: generateToken(user._id), user: publicUser(user) });
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
