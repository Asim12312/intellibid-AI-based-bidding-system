import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true,
        },
    });

    // Auth middleware for sockets
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie
                ?.split(';')
                .find(c => c.trim().startsWith('token='))
                ?.split('=')[1];

            if (!token) return next(new Error('Authentication required'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('_id firstName role');
            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        console.log(`[Socket] Connected: ${socket.user.firstName} (${userId})`);

        // Join personal room for notifications
        socket.join(`user:${userId}`);

        // Join conversation rooms
        socket.on('join:conversation', (conversationId) => {
            socket.join(`conv:${conversationId}`);
        });

        socket.on('leave:conversation', (conversationId) => {
            socket.leave(`conv:${conversationId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.user.firstName}`);
        });
    });

    console.log('[Socket] Socket.io initialized');
    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};
