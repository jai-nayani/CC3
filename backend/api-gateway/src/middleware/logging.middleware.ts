import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req: Request, res: Response) => {
  if (!req['startTime']) return '-';
  const diff = Date.now() - req['startTime'];
  return `${diff}ms`;
});

// Custom token for request body (sanitized)
morgan.token('request-body', (req: Request) => {
  if (!req.body) return '-';
  const sanitized = { ...req.body };
  // Remove sensitive fields
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.token) sanitized.token = '[REDACTED]';
  if (sanitized.apiKey) sanitized.apiKey = '[REDACTED]';
  return JSON.stringify(sanitized);
});

// Custom token for user info from JWT
morgan.token('user-id', (req: Request) => {
  return req['user']?.id || 'anonymous';
});

// Development format - verbose with colors
const devFormat = morgan(
  ':method :url :status :response-time-ms - :user-id',
  {
    skip: (req: Request) => req.url === '/health',
  }
);

// Production format - structured JSON logging
const prodFormat = morgan(
  (tokens, req: Request, res: Response) => {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      responseTime: tokens['response-time-ms'](req, res),
      userId: tokens['user-id'](req, res),
      ip: tokens['remote-addr'](req, res),
      userAgent: tokens['user-agent'](req, res),
      contentLength: tokens.res(req, res, 'content-length'),
    });
  },
  {
    skip: (req: Request) => req.url === '/health',
  }
);

// Request timing middleware
export const requestTimer = (req: Request, res: Response, next: NextFunction): void => {
  req['startTime'] = Date.now();
  next();
};

// Detailed request logger
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const { method, url, headers, query, body } = req;

  console.log('\n--- Incoming Request ---');
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);
  console.log('Query:', Object.keys(query).length > 0 ? query : 'None');

  if (method !== 'GET' && Object.keys(body || {}).length > 0) {
    const sanitizedBody = { ...body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    console.log('Body:', sanitizedBody);
  }

  console.log('Headers:', {
    'content-type': headers['content-type'],
    'authorization': headers.authorization ? '[PRESENT]' : '[MISSING]',
    'user-agent': headers['user-agent'],
  });

  next();
};

// Response logger
export const responseLogger = (req: Request, res: Response, next: NextFunction): void => {
  const originalSend = res.send;

  res.send = function (data: any): Response {
    const duration = Date.now() - (req['startTime'] || Date.now());

    console.log('\n--- Outgoing Response ---');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Duration: ${duration}ms`);
    console.log('----------------------\n');

    return originalSend.call(this, data);
  };

  next();
};

// Export the appropriate logger based on environment
export const logger = process.env.NODE_ENV === 'production' ? prodFormat : devFormat;

// Combined logging middleware
export const loggingMiddleware = [requestTimer, logger];
