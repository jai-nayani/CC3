import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import reportRoutes from './routes/report.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4004;
const REPORTS_DIR = process.env.REPORTS_OUTPUT_DIR || './reports';

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  console.log(`Created reports directory: ${REPORTS_DIR}`);
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'reporting-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Service info endpoint
app.get('/info', (req, res) => {
  res.json({
    service: 'Financial Analytics Reporting Service',
    version: '1.0.0',
    description: 'PDF, Excel, and CSV report generation service',
    endpoints: {
      pdf: 'POST /api/reports/pdf',
      excel: 'POST /api/reports/excel',
      csv: 'POST /api/reports/csv',
      status: 'GET /api/reports/status/:jobId',
      download: 'GET /api/reports/download/:jobId',
      templates: 'GET /api/reports/templates',
      jobs: 'GET /api/reports/jobs',
      stats: 'GET /api/reports/stats',
    },
    features: [
      'PDF report generation with HTML templates',
      'Excel workbooks with multiple sheets',
      'CSV exports with various formats',
      'Asynchronous job processing',
      'Job status tracking',
      'File download support',
    ],
  });
});

// API Routes
app.use('/api/reports', reportRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Financial Analytics Reporting Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      info: '/info',
      api: '/api/reports',
    },
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Financial Analytics Reporting Service           ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Reports directory: ${path.resolve(REPORTS_DIR)}`);
  console.log(`✓ Analytics Service: ${process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4002'}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  - http://localhost:${PORT}/health`);
  console.log(`  - http://localhost:${PORT}/info`);
  console.log(`  - http://localhost:${PORT}/api/reports`);
  console.log('');
  console.log('Report generation endpoints:');
  console.log(`  - POST http://localhost:${PORT}/api/reports/pdf`);
  console.log(`  - POST http://localhost:${PORT}/api/reports/excel`);
  console.log(`  - POST http://localhost:${PORT}/api/reports/csv`);
  console.log('');
  console.log('Job management endpoints:');
  console.log(`  - GET http://localhost:${PORT}/api/reports/status/:jobId`);
  console.log(`  - GET http://localhost:${PORT}/api/reports/download/:jobId`);
  console.log(`  - GET http://localhost:${PORT}/api/reports/templates`);
  console.log(`  - GET http://localhost:${PORT}/api/reports/jobs`);
  console.log(`  - GET http://localhost:${PORT}/api/reports/stats`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('════════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
