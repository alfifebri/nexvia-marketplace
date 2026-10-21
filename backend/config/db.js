import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

export const connectDB = async (uri = env.mongoUri) => {
  const connection = await mongoose.connect(uri, {
    autoIndex: !env.isProduction,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });

  const { name, host } = connection.connection;
  console.log(`[db] MongoDB connected → ${host}/${name}`);

  return connection;
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[db] MongoDB disconnected');
  }
};

export const isDatabaseReady = () => mongoose.connection.readyState === 1;
