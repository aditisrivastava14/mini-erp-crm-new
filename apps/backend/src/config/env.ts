import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requireEnv = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
};

const jwtSecret = requireEnv(process.env.JWT_SECRET, 'JWT_SECRET');

export const env = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoose: {
    url: process.env.MONGO_URI || 'mongodb://localhost:27017/gigflow',
  },
  jwt: {
    secret: jwtSecret,
  },
};
