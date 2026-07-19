import mongoose from 'mongoose';
import dns from 'node:dns';

// Atlas uses SRV records; Node's default resolver can fail on some Windows
// setups (IPv6 link-local nameserver). Pin public resolvers to be safe.
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch {
  /* ignore if unsupported */
}

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined in environment.');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
