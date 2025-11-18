import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { gatewayConfig, publicRoutes } from '../config/services';

export interface JWTPayload {
  id: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      startTime?: number;
    }
  }
}

/**
 * Validates JWT token and attaches user info to request
 * Forwards the token to downstream services for authentication
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip authentication for public routes
  if (isPublicRoute(req.path)) {
    return next();
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'No authentication token provided',
      code: 'NO_TOKEN',
    });
    return;
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, gatewayConfig.jwtSecret) as JWTPayload;

    // Attach user info to request for logging and downstream services
    req.user = decoded;

    // Token is valid, continue to next middleware
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    // Generic token validation error
    console.error('Token validation error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token validation failed',
      code: 'TOKEN_VALIDATION_FAILED',
    });
  }
};

/**
 * Check if the route is public and doesn't require authentication
 */
function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => {
    // Exact match
    if (route === path) return true;

    // Wildcard match (e.g., /auth/*)
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2);
      return path.startsWith(baseRoute);
    }

    return false;
  });
}

/**
 * Optional authentication middleware
 * Validates token if present but doesn't require it
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, gatewayConfig.jwtSecret) as JWTPayload;
    req.user = decoded;
  } catch (error) {
    // Token is invalid but we don't block the request
    console.warn('Optional auth token validation failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  next();
};

/**
 * Role-based authorization middleware
 * Requires authentication middleware to run first
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const userRole = req.user.role || 'user';

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to forward authentication headers to downstream services
 * This should be used with proxy middleware
 */
export const forwardAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Ensure Authorization header is forwarded
  if (req.headers.authorization) {
    req.headers['x-forwarded-authorization'] = req.headers.authorization;
  }

  // Add user context headers for downstream services
  if (req.user) {
    req.headers['x-user-id'] = req.user.id;
    req.headers['x-user-email'] = req.user.email;
    if (req.user.role) {
      req.headers['x-user-role'] = req.user.role;
    }
  }

  next();
};
