import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/apiRouter';
import { securityHeadersMiddleware } from './server/securityMiddleware';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Security hardening: Disable Express fingerprinting header
app.disable('x-powered-by');

// Security response headers across all routes
app.use(securityHeadersMiddleware);

// Body parser with size limits to prevent memory exhaustion
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Mount API endpoints
app.use('/api', apiRouter);

// Serve static assets from dist folder
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// SPA fallback to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Quiz Me! server running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown handler: close server on SIGTERM/SIGINT to prevent dangling connections
function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.warn('Forcing shutdown after timeout.');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
