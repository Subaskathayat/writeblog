import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import logger, { morganStream } from './config/logger.js';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import userRoutes from './routes/userRoutes.js';
import metaRoutes from './routes/metaRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Required so express-rate-limit sees the real client IP behind a host proxy
// (Render, Vercel, etc.) rather than the proxy's address.
app.set('trust proxy', 1);

// Security headers with sensible production defaults.
app.use(helmet());

// HTTP request logging piped through Winston.
app.use(morgan(isProd ? 'combined' : 'dev', { stream: morganStream }));

// Credentialed CORS: a concrete origin (not '*') is required for the refresh cookie.
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', metaRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => logger.info(`Server running on http://localhost:${PORT}`));
});
