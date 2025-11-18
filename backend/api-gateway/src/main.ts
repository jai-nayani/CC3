import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { gatewayConfig, routeMapping } from './config/services';
import { loggingMiddleware } from './middleware/logging.middleware';
import { authenticateToken, forwardAuth } from './middleware/auth.middleware';
import { generalLimiter, authLimiter, heavyOperationLimiter } from './middleware/rate-limit.middleware';
import {
  errorHandler,
  notFoundHandler,
  handleUncaughtException,
  handleUnhandledRejection,
} from './middleware/error.middleware';
import {
  createAllProxies,
  requestIdMiddleware,
  getAllServicesStatus,
} from './middleware/proxy.middleware';

// Load environment variables
dotenv.config();

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

// Create Express application
const app: Application = express();

// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: gatewayConfig.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Request-Id'],
}));

// =============================================================================
// REQUEST PARSING MIDDLEWARE
// =============================================================================

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request ID to all requests
app.use(requestIdMiddleware);

// =============================================================================
// LOGGING MIDDLEWARE
// =============================================================================

// Request/response logging
app.use(loggingMiddleware);

// =============================================================================
// HEALTH CHECK ENDPOINTS
// =============================================================================

// Gateway health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: gatewayConfig.env,
  });
});

// Comprehensive health check with all services
app.get('/api-gateway/health', async (req: Request, res: Response) => {
  try {
    const servicesStatus = await getAllServicesStatus();

    const allHealthy = servicesStatus.every(s => s.status === 'healthy');

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      service: 'api-gateway',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: gatewayConfig.env,
      services: servicesStatus,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      service: 'api-gateway',
      error: 'Failed to check services health',
      timestamp: new Date().toISOString(),
    });
  }
});

// Gateway information endpoint
app.get('/api-gateway/info', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'Financial Analytics Dashboard - API Gateway',
    version: '1.0.0',
    description: 'API Gateway for routing requests to microservices',
    environment: gatewayConfig.env,
    routes: Object.keys(routeMapping).map(route => ({
      path: route,
      service: routeMapping[route],
    })),
    documentation: '/api-gateway/docs',
  });
});

// =============================================================================
// RATE LIMITING
// =============================================================================

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Apply strict rate limiting to auth routes
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// Apply heavy operation rate limiting to reports
app.use('/reports', heavyOperationLimiter);

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

// Apply authentication to all routes except public ones
app.use(authenticateToken);

// Forward authentication headers to downstream services
app.use(forwardAuth);

// =============================================================================
// PROXY ROUTES
// =============================================================================

// Create proxies for all services
const proxies = createAllProxies();

// Register proxy routes
for (const [route, proxy] of Object.entries(proxies)) {
  app.use(route, proxy);
  console.log(`✓ Route registered: ${route}`);
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// =============================================================================
// SERVER STARTUP
// =============================================================================

const PORT = gatewayConfig.port;

const server = app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 API GATEWAY STARTED');
  console.log('========================================');
  console.log(`Environment: ${gatewayConfig.env}`);
  console.log(`Port: ${PORT}`);
  console.log(`CORS Origin: ${gatewayConfig.corsOrigin}`);
  console.log('\nRegistered Routes:');
  Object.entries(routeMapping).forEach(([route, service]) => {
    console.log(`  ${route} -> ${service}`);
  });
  console.log('\nHealth Check: http://localhost:' + PORT + '/health');
  console.log('Services Health: http://localhost:' + PORT + '/api-gateway/health');
  console.log('Gateway Info: http://localhost:' + PORT + '/api-gateway/info');
  console.log('========================================\n');
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('HTTP server closed');
    console.log('Shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export for testing
export default app;
