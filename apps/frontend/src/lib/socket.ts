import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

let socket: Socket | null = null;

export const initSocket = () => {
  if (socket) return socket;
  const token = useAuthStore.getState().token;
  const url = import.meta.env.VITE_API_URL || '/api/v1';

  socket = io(url, {
    autoConnect: true,
    transports: ['websocket'],
    auth: {
      token,
    },
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.info('Socket connected', socket?.id);
    const userId = useAuthStore.getState().user?.id;
    if (userId) socket?.emit('join', `user:${userId}`);
  });

  socket.on('disconnect', (reason) => {
    console.warn('Socket disconnected', reason);
  });

  socket.io.on('reconnect_attempt', () => {
    console.info('Socket attempting to reconnect');
  });

  socket.io.on('reconnect', (attempt) => {
    console.info('Socket reconnected after', attempt, 'attempts');
  });

  // Reconnection handling is provided by socket.io client defaults
  return socket;
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};
