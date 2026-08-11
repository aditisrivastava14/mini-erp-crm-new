import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDB } from './config/database';
import mongoose from 'mongoose';

import http from 'http';
import { initSocket } from './socket';

let server: http.Server | null = null;

connectDB().then(() => {
  server = http.createServer(app);
  server.listen(env.port, () => {
    logger.info(`Listening to port ${env.port}`);
  });

  // Initialize Socket.IO
  initSocket(server);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    });
  }
});
