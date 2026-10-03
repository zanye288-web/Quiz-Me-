import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/apiRouter';
import { securityHeadersMiddleware } from './server/securityMiddleware';

dotenv.config();

const app = express();
const PORT = 3000;

// Security hardening: Disable Express fingerprinting header
app.disable('x-powered-by');

// Security response headers across all routes
app.use(securityHeadersMiddleware);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Quiz Me! server running on http://0.0.0.0:${PORT}`);
});
