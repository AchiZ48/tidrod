import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import pool from './db';

export function setupSocket(httpServer: HttpServer): Server {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? ['http://localhost:3000']
                : ['http://localhost:3000', 'http://localhost:3001'],
            methods: ['GET', 'POST'],
        },
    });

    // Auth middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as {
                id: string;
                email: string;
                username: string;
            };
            (socket as any).user = decoded;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const user = (socket as any).user;
        console.log(`🔌 User connected: ${user.username} (${socket.id})`);

        // Join trip room
        socket.on('join_trip_room', (tripId: string) => {
            const room = `trip_${tripId}`;
            socket.join(room);
            console.log(`📍 ${user.username} joined room: ${room}`);
        });

        // Leave trip room
        socket.on('leave_trip_room', (tripId: string) => {
            const room = `trip_${tripId}`;
            socket.leave(room);
            console.log(`🚪 ${user.username} left room: ${room}`);
        });

        // Send message
        socket.on('send_message', async (data: { tripId: string; content: string }) => {
            try {
                const { tripId, content } = data;

                if (!tripId || !content || content.trim().length === 0) return;

                // Save to database
                const result = await pool.query(
                    'INSERT INTO messages (trip_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at',
                    [tripId, user.id, content.trim()]
                );

                const message = result.rows[0];
                const payload = {
                    id: message.id,
                    content: message.content,
                    created_at: message.created_at,
                    user_id: user.id,
                    username: user.username,
                };

                // Broadcast to the trip room
                io.to(`trip_${tripId}`).emit('receive_message', payload);
            } catch (err) {
                console.error('Socket send_message error:', err);
                socket.emit('error_message', { error: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${user.username} (${socket.id})`);
        });
    });

    return io;
}
