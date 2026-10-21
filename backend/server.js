import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

let server;
let isShuttingDown = false;

const start = async () => {
  await connectDB();

  server = app.listen(env.port, () => {
    console.log(`[api] Nexvia Marketplace API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  server.on('error', (error) => {
    console.error('[api] HTTP server error:', error);
    shutdown('serverError', 1);
  });
};

const shutdown = async (reason, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`[api] Shutting down (${reason})…`);

  const forceExit = setTimeout(() => {
    console.error('[api] Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10_000);

  forceExit.unref();

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeIdleConnections?.();
      });
    }

    await disconnectDB();
    clearTimeout(forceExit);
    process.exit(exitCode);
  } catch (error) {
    console.error('[api] Error during shutdown:', error);
    clearTimeout(forceExit);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('[api] Unhandled promise rejection:', reason);
  shutdown('unhandledRejection', 1);
});
process.on('uncaughtException', (error) => {
  console.error('[api] Uncaught exception:', error);
  shutdown('uncaughtException', 1);
});

start().catch((error) => {
  console.error('[api] Failed to start:', error);
  process.exit(1);
});
