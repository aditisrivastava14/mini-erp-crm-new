import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../config/logger';

let io: Server | null = null;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join user room if provided
    const { userId } = socket.handshake.query as any;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('join', (room: string) => socket.join(room));

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const emit = (event: string, payload: any, room?: string) => {
  if (!io) return;
  if (room) io.to(room).emit(event, payload);
  else io.emit(event, payload);
};
