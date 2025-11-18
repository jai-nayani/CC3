import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * General rate limiter: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'You have exceeded the 100 requests in 15 minutes limit',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check endpoints
  skip: (req: Request) => req.url === '/health' || req.url === '/api-gateway/health',
  // Use IP address as the key
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  // Handler for when rate limit is exceeded
  handler: (req: Request, res: Response) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      limit: 100,
      window: '15 minutes',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints: 5 requests per 15 minutes
 * Prevents brute force attacks on login/register endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts. Please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator: (req: Request) => {
    // Use IP + email (if provided) for more granular limiting
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  },
  handler: (req: Request, res: Response) => {
    console.warn(`Auth rate limit exceeded for IP: ${req.ip}, Email: ${req.body?.email || 'N/A'}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      limit: 5,
      window: '15 minutes',
    });
  },
});

/**
 * Moderate rate limiter for API endpoints: 200 requests per 15 minutes
 * More lenient for general API usage
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'API rate limit exceeded',
    code: 'API_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    const identifier = req.user?.id || req.ip;
    console.warn(`API rate limit exceeded for: ${identifier}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded the API rate limit. Please try again later.',
      code: 'API_RATE_LIMIT_EXCEEDED',
      limit: 200,
      window: '15 minutes',
    });
  },
});

/**
 * Heavy operation rate limiter: 10 requests per 15 minutes
 * For resource-intensive operations like reports generation
 */
export const heavyOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many heavy operations. Please try again later.',
    code: 'HEAVY_OPERATION_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    const identifier = req.user?.id || req.ip;
    console.warn(`Heavy operation rate limit exceeded for: ${identifier}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have exceeded the limit for resource-intensive operations.',
      code: 'HEAVY_OPERATION_RATE_LIMIT_EXCEEDED',
      limit: 10,
      window: '15 minutes',
    });
  },
});

/**
 * Get the appropriate rate limiter based on the route
 */
export function getRateLimiter(path: string) {
  if (path.startsWith('/auth/login') || path.startsWith('/auth/register')) {
    return authLimiter;
  }

  if (path.startsWith('/reports')) {
    return heavyOperationLimiter;
  }

  if (path.startsWith('/analytics')) {
    return apiLimiter;
  }

  return generalLimiter;
}
