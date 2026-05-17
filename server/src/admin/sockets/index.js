import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/generateTokens.js';
import { logger } from '../utils/logger.js';
import * as analyticsService from '../services/analytics.service.js';
import { env } from '../config/env.js';

function verifySocketToken(token) {
  try {
    return verifyAccessToken(token);
  } catch {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error('Forbidden');
    return { sub: decoded.id, role: 'admin' };
  }
}

let io = null;
let metricsInterval = null;

export function initSockets(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [env.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token && socket.handshake.headers.cookie) {
        const match = socket.handshake.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }
      if (!token) return next(new Error('Authentication required'));
      const decoded = verifySocketToken(token);
      socket.adminId = decoded.sub;
      socket.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);
    socket.join('admin:dashboard');
    socket.join('admin:monitoring');

    socket.on('ticket:join', (ticketId) => {
      if (ticketId) socket.join(`ticket:${ticketId}`);
    });

    socket.on('ticket:leave', (ticketId) => {
      if (ticketId) socket.leave(`ticket:${ticketId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  metricsInterval = setInterval(async () => {
    try {
      const [metrics, monitoring] = await Promise.all([
        analyticsService.getDashboardMetrics(),
        analyticsService.getMonitoringStats(),
      ]);
      io.to('admin:dashboard').emit('metrics:update', metrics);
      io.to('admin:monitoring').emit('monitoring:live', monitoring);
    } catch (err) {
      logger.warn('Socket metrics broadcast failed', { err: err.message });
    }
  }, 15000);

  return io;
}

export function getIO() {
  return io;
}

export function emitTicketMessage(ticketId, message) {
  if (io) io.to(`ticket:${ticketId}`).emit('ticket:message', message);
}

export function emitNotification(adminId, notification) {
  if (io) {
    io.to('admin:dashboard').emit('notification:new', notification);
    if (adminId) io.to(`admin:${adminId}`).emit('notification:new', notification);
  }
}

export function emitAuctionBid(auction) {
  if (io) io.to('admin:monitoring').emit('auction:bid', auction);
}

export function stopSockets() {
  if (metricsInterval) clearInterval(metricsInterval);
  if (io) io.close();
}
