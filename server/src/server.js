import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSockets, stopSockets } from './admin/sockets/index.js';
import { assertAdminEnv } from './admin/config/env.js';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  assertAdminEnv();
  await connectDB();

  const server = http.createServer(app);
  initSockets(server);

  server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
    console.log(`Admin API: http://localhost:${PORT}/api/v1`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);
    stopSockets();
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
