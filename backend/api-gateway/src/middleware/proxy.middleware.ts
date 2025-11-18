import { Request, Response, RequestHandler } from 'express';
import { createProxyMiddleware, Options, responseInterceptor } from 'http-proxy-middleware';
import { services, routeMapping } from '../config/services';
import { serviceUnavailableError, gatewayTimeoutError } from './error.middleware';

/**
 * Create proxy middleware for a specific service
 */
export function createServiceProxy(serviceName: string): RequestHandler {
  const service = services[serviceName];

  if (!service) {
    throw new Error(`Service configuration not found: ${serviceName}`);
  }

  const proxyOptions: Options = {
    target: service.url,
    changeOrigin: true,
    timeout: service.timeout || 30000,
    proxyTimeout: service.timeout || 30000,

    // Path rewriting - remove the service prefix from the path
    pathRewrite: (path: string, req: Request) => {
      // For example: /claims/123 -> /123
      const prefix = Object.keys(routeMapping).find(key => routeMapping[key] === serviceName);
      if (prefix && path.startsWith(prefix)) {
        return path.replace(prefix, '');
      }
      return path;
    },

    // Forward headers
    onProxyReq: (proxyReq, req: Request, res: Response) => {
      // Log proxy request
      console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${service.url}${proxyReq.path}`);

      // Forward authentication headers
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }

      // Forward user context headers
      if (req.headers['x-user-id']) {
        proxyReq.setHeader('X-User-Id', req.headers['x-user-id']);
      }
      if (req.headers['x-user-email']) {
        proxyReq.setHeader('X-User-Email', req.headers['x-user-email']);
      }
      if (req.headers['x-user-role']) {
        proxyReq.setHeader('X-User-Role', req.headers['x-user-role']);
      }

      // Add gateway headers
      proxyReq.setHeader('X-Gateway', 'api-gateway');
      proxyReq.setHeader('X-Gateway-Version', '1.0.0');
      proxyReq.setHeader('X-Forwarded-For', req.ip || 'unknown');
      proxyReq.setHeader('X-Forwarded-Host', req.hostname);
      proxyReq.setHeader('X-Forwarded-Proto', req.protocol);

      // Add request ID for tracing
      const requestId = req.headers['x-request-id'] || generateRequestId();
      proxyReq.setHeader('X-Request-Id', requestId);

      // For POST/PUT/PATCH, ensure content-type is preserved
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },

    // Handle proxy response
    onProxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req: Request, res: Response) => {
        // Log proxy response
        console.log(
          `[PROXY RESPONSE] ${req.method} ${req.originalUrl} <- ${service.url} [${proxyRes.statusCode}]`
        );

        // Forward response headers
        if (proxyRes.headers['x-total-count']) {
          res.setHeader('X-Total-Count', proxyRes.headers['x-total-count']);
        }
        if (proxyRes.headers['x-page']) {
          res.setHeader('X-Page', proxyRes.headers['x-page']);
        }

        // Return the response as-is
        return responseBuffer;
      }
    ),

    // Error handling
    onError: (err: any, req: Request, res: Response) => {
      console.error(`[PROXY ERROR] ${service.name}:`, err.message);

      // Handle timeout errors
      if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
        const error = gatewayTimeoutError(service.name);
        res.status(504).json({
          error: 'Gateway Timeout',
          message: error.message,
          code: error.code,
          service: serviceName,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Handle connection errors
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ECONNRESET') {
        const error = serviceUnavailableError(service.name);
        res.status(503).json({
          error: 'Service Unavailable',
          message: error.message,
          code: error.code,
          service: serviceName,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Generic proxy error
      res.status(502).json({
        error: 'Bad Gateway',
        message: `Failed to communicate with ${service.name}`,
        code: 'PROXY_ERROR',
        service: serviceName,
        timestamp: new Date().toISOString(),
      });
    },

    // Logging
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  };

  return createProxyMiddleware(proxyOptions);
}

/**
 * Create all service proxies based on route mapping
 */
export function createAllProxies(): { [path: string]: RequestHandler } {
  const proxies: { [path: string]: RequestHandler } = {};

  // Create a proxy for each route
  for (const [route, serviceName] of Object.entries(routeMapping)) {
    try {
      proxies[route] = createServiceProxy(serviceName);
      console.log(`✓ Proxy created: ${route} -> ${services[serviceName].url}`);
    } catch (error) {
      console.error(`✗ Failed to create proxy for ${route}:`, error);
    }
  }

  return proxies;
}

/**
 * Generate a unique request ID for tracing
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Middleware to add request ID to all requests
 */
export function requestIdMiddleware(req: Request, res: Response, next: Function): void {
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = generateRequestId();
  }
  res.setHeader('X-Request-Id', req.headers['x-request-id']);
  next();
}

/**
 * Get service status by name
 */
export async function getServiceStatus(serviceName: string): Promise<{
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
}> {
  const service = services[serviceName];

  if (!service) {
    return {
      name: serviceName,
      url: 'unknown',
      status: 'unknown',
      error: 'Service not configured',
    };
  }

  try {
    const startTime = Date.now();
    const axios = require('axios');

    const healthUrl = `${service.url}${service.healthEndpoint || '/health'}`;
    const response = await axios.get(healthUrl, {
      timeout: service.timeout || 5000,
    });

    const responseTime = Date.now() - startTime;

    return {
      name: service.name,
      url: service.url,
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      responseTime,
    };
  } catch (error: any) {
    return {
      name: service.name,
      url: service.url,
      status: 'unhealthy',
      error: error.message,
    };
  }
}

/**
 * Get status of all services
 */
export async function getAllServicesStatus(): Promise<any[]> {
  const statusPromises = Object.keys(services).map(serviceName =>
    getServiceStatus(serviceName)
  );

  return Promise.all(statusPromises);
}
