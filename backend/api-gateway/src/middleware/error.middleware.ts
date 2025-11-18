import { Request, Response, NextFunction } from 'express';
import { gatewayConfig } from '../config/services';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
  isOperational?: boolean;
}

/**
 * Custom error class for operational errors
 */
export class OperationalError extends Error implements AppError {
  statusCode: number;
  code: string;
  details?: any;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
  }
}

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error: AppError = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

/**
 * Global error handler middleware
 * Must be defined with 4 parameters to be recognized as error handler
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  // Log error details
  logError(err, req);

  // Don't expose internal error details in production
  const isDevelopment = gatewayConfig.env === 'development';

  const errorResponse: any = {
    error: getErrorName(statusCode),
    message,
    code,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Add additional details in development mode
  if (isDevelopment) {
    errorResponse.stack = err.stack;
    if (err.details) {
      errorResponse.details = err.details;
    }
  }

  // Add request ID if available
  if (req.headers['x-request-id']) {
    errorResponse.requestId = req.headers['x-request-id'];
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Log error details
 */
function logError(err: AppError, req: Request): void {
  const isDevelopment = gatewayConfig.env === 'development';
  const timestamp = new Date().toISOString();

  console.error('\n=== ERROR OCCURRED ===');
  console.error(`Timestamp: ${timestamp}`);
  console.error(`Path: ${req.method} ${req.originalUrl}`);
  console.error(`IP: ${req.ip}`);
  console.error(`User: ${req.user?.id || 'anonymous'}`);
  console.error(`Status: ${err.statusCode || 500}`);
  console.error(`Code: ${err.code || 'UNKNOWN'}`);
  console.error(`Message: ${err.message}`);

  if (err.details) {
    console.error('Details:', err.details);
  }

  if (isDevelopment && err.stack) {
    console.error('Stack:', err.stack);
  }

  console.error('=====================\n');

  // In production, you might want to send this to a logging service
  // e.g., Sentry, LogRocket, DataDog, etc.
}

/**
 * Get human-readable error name from status code
 */
function getErrorName(statusCode: number): string {
  const errorNames: { [key: number]: string } = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    408: 'Request Timeout',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
  };

  return errorNames[statusCode] || 'Error';
}

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (error: Error) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    // Give the server time to finish current requests
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error('Reason:', reason);
    console.error('Promise:', promise);

    // Give the server time to finish current requests
    process.exit(1);
  });
};

/**
 * Validation error helper
 */
export const validationError = (message: string, details?: any): AppError => {
  const error = new OperationalError(message, 400, 'VALIDATION_ERROR', details);
  return error;
};

/**
 * Service unavailable error helper
 */
export const serviceUnavailableError = (serviceName: string): AppError => {
  const error = new OperationalError(
    `${serviceName} is currently unavailable`,
    503,
    'SERVICE_UNAVAILABLE',
    { service: serviceName }
  );
  return error;
};

/**
 * Gateway timeout error helper
 */
export const gatewayTimeoutError = (serviceName: string): AppError => {
  const error = new OperationalError(
    `Request to ${serviceName} timed out`,
    504,
    'GATEWAY_TIMEOUT',
    { service: serviceName }
  );
  return error;
};
