export interface ServiceConfig {
  name: string;
  url: string;
  healthEndpoint?: string;
  timeout?: number;
}

export interface ServicesConfig {
  [key: string]: ServiceConfig;
}

// Service configuration with URLs and health check endpoints
export const services: ServicesConfig = {
  auth: {
    name: 'Authentication Service',
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    healthEndpoint: '/health',
    timeout: 5000,
  },
  users: {
    name: 'User Service',
    url: process.env.USER_SERVICE_URL || 'http://localhost:4001',
    healthEndpoint: '/health',
    timeout: 5000,
  },
  analytics: {
    name: 'Analytics Service',
    url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4002',
    healthEndpoint: '/health',
    timeout: 10000,
  },
  claims: {
    name: 'Claims Service',
    url: process.env.CLAIMS_SERVICE_URL || 'http://localhost:4003',
    healthEndpoint: '/health',
    timeout: 5000,
  },
  facilities: {
    name: 'Facilities Service',
    url: process.env.FACILITIES_SERVICE_URL || 'http://localhost:4003',
    healthEndpoint: '/health',
    timeout: 5000,
  },
  departments: {
    name: 'Departments Service',
    url: process.env.DEPARTMENTS_SERVICE_URL || 'http://localhost:4003',
    healthEndpoint: '/health',
    timeout: 5000,
  },
  payers: {
    name: 'Payers Service',
    url: process.env.PAYERS_SERVICE_URL || 'http://localhost:4003',
    healthEndpoint: '/health',
    timeout: 5000,
  },
  payments: {
    name: 'Payments Service',
    url: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:4003',
    healthEndpoint: '/health',
    timeout: 5000,
  },
  reports: {
    name: 'Reports Service',
    url: process.env.REPORTS_SERVICE_URL || 'http://localhost:4004',
    healthEndpoint: '/health',
    timeout: 10000,
  },
};

// Route to service mapping
export const routeMapping: { [key: string]: string } = {
  '/auth': 'auth',
  '/users': 'users',
  '/analytics': 'analytics',
  '/claims': 'claims',
  '/facilities': 'facilities',
  '/departments': 'departments',
  '/payers': 'payers',
  '/payments': 'payments',
  '/reports': 'reports',
};

// Public routes that don't require authentication
export const publicRoutes: string[] = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/health',
  '/api-gateway/health',
];

// API Gateway configuration
export const gatewayConfig = {
  port: parseInt(process.env.PORT || '4000', 10),
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'info',
};
