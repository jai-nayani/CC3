import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { prismaClient } from '@financial-analytics/shared';

// Load environment variables
dotenv.config();

/**
 * Analytics Service
 * Microservice for calculating KPIs and analytics for the Financial Analytics Dashboard
 */
class AnalyticsService {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '4002', 10);

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize Express middlewares
   */
  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
      })
    );

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    });

    this.app.use('/api/analytics', limiter);

    // Request logging middleware
    this.app.use((req: Request, res: Response, next) => {
      const requestId = req.headers['x-request-id'] || this.generateRequestId();
      req.headers['x-request-id'] = requestId as string;

      console.log({
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        query: req.query,
        requestId,
        ip: req.ip,
      });

      next();
    });
  }

  /**
   * Initialize API routes
   */
  private initializeRoutes(): void {
    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        success: true,
        data: {
          service: 'Financial Analytics - Analytics Service',
          version: '1.0.0',
          status: 'running',
          endpoints: {
            health: '/api/analytics/health',
            kpis: '/api/analytics/kpis',
            revenue: '/api/analytics/revenue',
            collections: '/api/analytics/collections',
            claims: '/api/analytics/claims',
            trends: '/api/analytics/trends',
            compare: '/api/analytics/compare',
          },
          documentation: '/api/analytics/docs',
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    });

    // Analytics routes
    this.app.use('/api/analytics', analyticsRoutes);

    // API documentation
    this.app.get('/api/analytics/docs', (req: Request, res: Response) => {
      res.json({
        success: true,
        data: {
          service: 'Analytics Service',
          version: '1.0.0',
          description: 'RESTful API for healthcare financial analytics and KPI calculations',
          endpoints: [
            {
              method: 'GET',
              path: '/api/analytics/kpis',
              description: 'Get all KPIs with optional filters',
              parameters: [
                { name: 'startDate', type: 'string', description: 'Start date (ISO 8601)' },
                { name: 'endDate', type: 'string', description: 'End date (ISO 8601)' },
                { name: 'facilityId', type: 'string', description: 'Filter by facility ID' },
                { name: 'departmentId', type: 'string', description: 'Filter by department ID' },
                { name: 'payerId', type: 'string', description: 'Filter by payer ID' },
                { name: 'status', type: 'string', description: 'Filter by claim status' },
              ],
            },
            {
              method: 'GET',
              path: '/api/analytics/kpis/:name',
              description: 'Get specific KPI by name',
              parameters: [
                { name: 'name', type: 'string', description: 'KPI name (kebab-case)', in: 'path' },
              ],
            },
            {
              method: 'GET',
              path: '/api/analytics/revenue',
              description: 'Get revenue-specific metrics',
              returns: ['grossRevenue', 'netRevenue', 'revenueGrowth', 'revenueByFacility', 'revenuePerPatient'],
            },
            {
              method: 'GET',
              path: '/api/analytics/collections',
              description: 'Get A/R and collection metrics',
              returns: ['collectionRate', 'daysInAR', 'arAging', 'outstandingBalance', 'cashCollections'],
            },
            {
              method: 'GET',
              path: '/api/analytics/claims',
              description: 'Get claims-specific metrics',
              returns: ['cleanClaimRate', 'denialRate', 'claimVolume', 'denialRecoveryRate'],
            },
            {
              method: 'GET',
              path: '/api/analytics/trends',
              description: 'Get trend analysis for a specific metric',
              parameters: [
                { name: 'metric', type: 'string', description: 'Metric to analyze' },
                { name: 'periods', type: 'number', description: 'Number of periods' },
              ],
            },
            {
              method: 'GET',
              path: '/api/analytics/compare',
              description: 'Compare metrics across dimensions',
              parameters: [
                { name: 'dimension', type: 'string', description: 'facility, payer, or department' },
                { name: 'metric', type: 'string', description: 'Metric to compare' },
              ],
            },
          ],
          kpis: [
            'grossRevenue',
            'netRevenue',
            'revenueGrowth',
            'revenueByFacility',
            'revenuePerPatient',
            'collectionRate',
            'daysInAR',
            'arAging',
            'outstandingBalance',
            'cashCollections',
            'cleanClaimRate',
            'denialRate',
            'claimVolume',
            'denialRecoveryRate',
            'patientVolume',
            'payerMix',
            'revenueCycleDays',
          ],
        },
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Test database connection
   */
  private async testDatabaseConnection(): Promise<void> {
    try {
      await prismaClient.$connect();
      console.log('✓ Database connection established');
    } catch (error) {
      console.error('✗ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Test database connection
      await this.testDatabaseConnection();

      // Start server
      this.app.listen(this.port, () => {
        console.log('\n========================================');
        console.log('  Financial Analytics - Analytics Service');
        console.log('========================================');
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`Port: ${this.port}`);
        console.log(`URL: http://localhost:${this.port}`);
        console.log(`API Base: http://localhost:${this.port}/api/analytics`);
        console.log('========================================');
        console.log('Available Endpoints:');
        console.log(`  GET  /api/analytics/health`);
        console.log(`  GET  /api/analytics/kpis`);
        console.log(`  GET  /api/analytics/kpis/:name`);
        console.log(`  GET  /api/analytics/revenue`);
        console.log(`  GET  /api/analytics/collections`);
        console.log(`  GET  /api/analytics/claims`);
        console.log(`  GET  /api/analytics/trends`);
        console.log(`  GET  /api/analytics/compare`);
        console.log(`  GET  /api/analytics/docs`);
        console.log('========================================');
        console.log('✓ Server is running\n');
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    console.log('\nShutting down gracefully...');
    await prismaClient.$disconnect();
    console.log('✓ Database connection closed');
    process.exit(0);
  }
}

// Create and start server
const analyticsService = new AnalyticsService();
analyticsService.start();

// Handle graceful shutdown
process.on('SIGTERM', () => analyticsService.shutdown());
process.on('SIGINT', () => analyticsService.shutdown());

export default analyticsService;
