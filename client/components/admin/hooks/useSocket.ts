import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../lib/api';

const socketBase = () =>
  (process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(
    /\/$/,
    ''
  );

export function useSocket(enabled: boolean) {
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [monitoring, setMonitoring] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const token = getAccessToken();

    const socket = io(socketBase(), {
      path: '/socket.io',
      auth: token ? { token } : {},
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('metrics:update', (p: Record<string, unknown>) => setMetrics(p));
    socket.on('monitoring:live', (p: Record<string, unknown>) => setMonitoring(p));

    return () => {
      socket.disconnect();
    };
  }, [enabled]);

  return { metrics, monitoring };
}
