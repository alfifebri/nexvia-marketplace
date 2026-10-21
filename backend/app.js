import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiters.js';
import { requestId } from './middleware/requestId.js';
import { ApiError } from './utils/ApiError.js';
import { sendSuccess } from './utils/ApiResponse.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.trustProxy);

const corsOptions = {
  origin(origin, callback) {
    const isAllowed =
      !origin || env.cors.origins.includes('*') || env.cors.origins.includes(origin);

    if (isAllowed) return callback(null, true);

    return callback(
      new ApiError(403, `Origin ${origin} is not allowed by CORS policy.`, {
        code: 'CORS_ORIGIN_DENIED',
      }),
    );
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id', 'RateLimit', 'RateLimit-Policy'],
  maxAge: 86_400,
};

app.use(requestId);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

const databaseStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

app.get('/api/health', (_req, res) =>
  sendSuccess(res, {
    message: 'Nexvia Marketplace API is running.',
    data: {
      status: 'ok',
      environment: env.nodeEnv,
      database: databaseStates[mongoose.connection.readyState] || 'unknown',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  }),
);

app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
