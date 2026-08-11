import mongoose from 'mongoose';
import { logger } from './logger';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongoose.url);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: unknown) {
  if (error instanceof Error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
  } else {
    logger.error('Unknown MongoDB connection error');
  }

  process.exit(1);
}
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});
