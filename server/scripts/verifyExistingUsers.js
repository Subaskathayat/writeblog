// One-off migration: mark all pre-existing users as verified so the new
// email-verification requirement doesn't lock out accounts created before it.
// Run once: `node scripts/verifyExistingUsers.js`
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

await connectDB();
const res = await User.updateMany(
  { isVerified: { $ne: true } },
  { $set: { isVerified: true } }
);
console.log(`Marked ${res.modifiedCount} existing user(s) as verified.`);
await mongoose.disconnect();
process.exit(0);
