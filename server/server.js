import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import userRoutes from './routes/userRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Required so express-rate-limit sees the real client IP behind a host proxy
// (Render, Vercel, etc.) rather than the proxy's address.
app.set('trust proxy', 1);

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', metaRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
