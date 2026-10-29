import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leaves.js';
import announcementRoutes from './routes/announcements.js';
import trainingRoutes from './routes/trainings.js';
import analyticsRoutes from './routes/analytics.js';
import notificationRoutes from './routes/notifications.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS configuration (flexible for local dev and cloud deployments on Vercel)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or any vercel / localhost origin
    if (!origin) return callback(null, true);
    if (
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin === process.env.CLIENT_URL ||
      process.env.CLIENT_URL === '*'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Rate limiting
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check with DB status
app.get('/api/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI || '';
  res.json({
    status: 'ok',
    service: 'StaffSync HRMS API',
    database: {
      status: states[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
      hasMongoUri: Boolean(rawUri),
      uriPreview: rawUri ? rawUri.replace(/:([^@]+)@/, ':****@') : 'NONE_PROVIDED',
    },
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

// Connect to MongoDB and listen
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`[StaffSync API] Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('[StaffSync API] MongoDB Connection Failed:', err.message);
    app.listen(port, () => {
      console.warn(`[StaffSync API] Server running in degraded mode on port ${port} without database.`);
    });
  });
