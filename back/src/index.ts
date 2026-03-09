import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { initDatabase } from './init-db';
import { setupSocket } from './socket';
import authRoutes from './routes/auth';
import tripRoutes from './routes/trips';
import markerRoutes from './routes/markers';
import messageRoutes from './routes/messages';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['http://localhost:3000']
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Auth routes have stricter rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many auth attempts, please try again later' },
});
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/markers', markerRoutes);
app.use('/api/trips', messageRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io
setupSocket(httpServer);

// Start
const PORT = parseInt(process.env.PORT || '5000');

async function start() {
    try {
        await initDatabase();
        httpServer.listen(PORT, () => {
            console.log(`🚀 TidRod Backend running on http://localhost:${PORT}`);
            console.log(`📡 WebSocket server ready`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
