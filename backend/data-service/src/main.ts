import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { claimRouter } from './routes/claim.routes';
import { facilityRouter } from './routes/facility.routes';
import { departmentRouter } from './routes/department.routes';
import { payerRouter } from './routes/payer.routes';
import { paymentRouter } from './routes/payment.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Express = express();
const PORT = process.env.DATA_SERVICE_PORT || process.env.PORT || 4003;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'data-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/claims', claimRouter);
app.use('/facilities', facilityRouter);
app.use('/departments', departmentRouter);
app.use('/payers', payerRouter);
app.use('/payments', paymentRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Data Service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Routes:`);
  console.log(`   - POST   /claims`);
  console.log(`   - GET    /claims`);
  console.log(`   - GET    /claims/:id`);
  console.log(`   - PUT    /claims/:id`);
  console.log(`   - DELETE /claims/:id`);
  console.log(`   - GET    /claims/stats`);
  console.log(`   - GET    /facilities`);
  console.log(`   - GET    /facilities/:id`);
  console.log(`   - GET    /departments`);
  console.log(`   - GET    /departments/facility/:facilityId`);
  console.log(`   - GET    /payers`);
  console.log(`   - GET    /payments`);
  console.log(`   - POST   /payments`);
});

export default app;
