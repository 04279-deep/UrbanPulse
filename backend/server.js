import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import { connectDB } from './config/db.js';
import { initSocket } from './services/socketService.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import infrastructureRoutes from './routes/infrastructureRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
initSocket(io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads folder
const uploadsPath = path.resolve('uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/infrastructure', infrastructureRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/health', (req, res) => {
  res.json({
    platform: 'UrbanPulse Backend API',
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to UrbanPulse Smart Urban Infrastructure Monitoring API',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      complaints: '/api/complaints',
      analytics: '/api/analytics/dashboard',
      departments: '/api/departments',
      teams: '/api/teams',
      infrastructure: '/api/infrastructure',
      notifications: '/api/notifications',
      feedback: '/api/feedback',
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[UrbanPulse Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

export default app;
