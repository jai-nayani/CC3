# API Gateway - Financial Analytics Dashboard

Production-ready API Gateway for routing requests to microservices in the Financial Analytics Dashboard system.

## Overview

The API Gateway serves as the single entry point for all client requests, routing them to the appropriate microservices. It provides:

- **Request Routing**: Intelligent routing to multiple backend services
- **Authentication**: JWT-based authentication and authorization
- **Rate Limiting**: Protection against abuse with configurable limits
- **Request/Response Logging**: Comprehensive logging for monitoring and debugging
- **Error Handling**: Centralized error handling with detailed error responses
- **Health Monitoring**: Health checks for all downstream services
- **Security**: Helmet.js security headers and CORS configuration

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│          API Gateway (Port 4000)        │
│  ┌─────────────────────────────────┐   │
│  │  Security & Rate Limiting       │   │
│  ├─────────────────────────────────┤   │
│  │  Authentication (JWT)           │   │
│  ├─────────────────────────────────┤   │
│  │  Request Logging                │   │
│  ├─────────────────────────────────┤   │
│  │  Proxy Routing                  │   │
│  └─────────────────────────────────┘   │
└───────────┬─────────────────────────────┘
            │
    ┌───────┴────────┬─────────┬────────┐
    ▼                ▼         ▼        ▼
┌─────────┐    ┌──────────┐  ...  ┌─────────┐
│Auth Svc │    │Analytics │       │Reports  │
│(4001)   │    │Svc(4002) │       │Svc(4004)│
└─────────┘    └──────────┘       └─────────┘
```

## Route Mapping

| Route          | Service            | Port |
|----------------|-------------------|------|
| /auth/*        | Auth Service      | 4001 |
| /users/*       | User Service      | 4001 |
| /analytics/*   | Analytics Service | 4002 |
| /claims/*      | Claims Service    | 4003 |
| /facilities/*  | Claims Service    | 4003 |
| /departments/* | Claims Service    | 4003 |
| /payers/*      | Claims Service    | 4003 |
| /payments/*    | Claims Service    | 4003 |
| /reports/*     | Reports Service   | 4004 |

## Features

### 1. Authentication & Authorization

- **JWT Validation**: Validates JWT tokens on protected routes
- **Token Forwarding**: Forwards authentication headers to downstream services
- **User Context**: Injects user information into request headers
- **Public Routes**: Configurable public routes that bypass authentication
- **Role-Based Access**: Support for role-based authorization

### 2. Rate Limiting

Multiple rate limiting strategies:

- **General**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login/register attempts per 15 minutes (prevents brute force)
- **API Endpoints**: 200 requests per 15 minutes for authenticated users
- **Heavy Operations**: 10 requests per 15 minutes for resource-intensive operations (reports)

### 3. Request/Response Logging

- **Morgan Integration**: HTTP request logging with custom tokens
- **Request Timing**: Tracks and logs response times
- **User Tracking**: Logs user IDs from JWT tokens
- **Sanitization**: Automatically redacts sensitive information (passwords, tokens)
- **Environment-Based**: Verbose logging in development, structured JSON in production

### 4. Error Handling

- **Centralized Error Handler**: Consistent error responses across all endpoints
- **Operational Errors**: Custom error classes for different error types
- **Service Errors**: Handles downstream service failures gracefully
- **Timeout Handling**: Configurable timeouts with proper error messages
- **Development vs Production**: Detailed errors in dev, sanitized in production

### 5. Health Monitoring

- **Gateway Health**: `/health` - Quick health check of the gateway itself
- **Services Health**: `/api-gateway/health` - Comprehensive check of all downstream services
- **Gateway Info**: `/api-gateway/info` - Information about routes and configuration

## Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Service URLs
AUTH_SERVICE_URL=http://localhost:4001
ANALYTICS_SERVICE_URL=http://localhost:4002
CLAIMS_SERVICE_URL=http://localhost:4003
REPORTS_SERVICE_URL=http://localhost:4004
```

### Public Routes

Configure public routes in `src/config/services.ts`:

```typescript
export const publicRoutes: string[] = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/health',
  '/api-gateway/health',
];
```

## Usage

### Development

```bash
# Run in development mode with auto-reload
npm run dev

# Or with nodemon
npm run dev:watch
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "api-gateway",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

### Comprehensive Health Check

```http
GET /api-gateway/health
```

Response:
```json
{
  "status": "healthy",
  "service": "api-gateway",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": [
    {
      "name": "Authentication Service",
      "url": "http://localhost:4001",
      "status": "healthy",
      "responseTime": 45
    },
    // ... other services
  ]
}
```

### Gateway Information

```http
GET /api-gateway/info
```

Response:
```json
{
  "name": "Financial Analytics Dashboard - API Gateway",
  "version": "1.0.0",
  "description": "API Gateway for routing requests to microservices",
  "routes": [
    { "path": "/auth", "service": "auth" },
    { "path": "/analytics", "service": "analytics" }
    // ... other routes
  ]
}
```

## Request Flow

1. **Client Request**: Client sends request to API Gateway
2. **Request ID**: Gateway assigns unique request ID for tracing
3. **Rate Limiting**: Request is checked against rate limits
4. **Authentication**: JWT token is validated (if required)
5. **Logging**: Request details are logged
6. **Proxy**: Request is forwarded to appropriate service
7. **Response**: Service response is returned to client
8. **Error Handling**: Any errors are caught and formatted consistently

## Headers

### Request Headers

- `Authorization: Bearer <token>` - JWT authentication token
- `Content-Type: application/json` - Request content type
- `X-Request-Id: <id>` - Optional request ID for tracing

### Response Headers

- `X-Request-Id: <id>` - Request tracing ID
- `X-Total-Count: <count>` - Total count for paginated results
- `X-Page: <page>` - Current page number
- `RateLimit-Limit: <limit>` - Rate limit threshold
- `RateLimit-Remaining: <remaining>` - Remaining requests
- `RateLimit-Reset: <timestamp>` - Rate limit reset time

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint",
  "method": "GET"
}
```

Common error codes:

- `RATE_LIMIT_EXCEEDED` - Too many requests
- `NO_TOKEN` - No authentication token provided
- `TOKEN_EXPIRED` - JWT token has expired
- `INVALID_TOKEN` - Invalid JWT token
- `ROUTE_NOT_FOUND` - Endpoint not found
- `SERVICE_UNAVAILABLE` - Downstream service unavailable
- `GATEWAY_TIMEOUT` - Downstream service timeout
- `PROXY_ERROR` - Error communicating with service

## Monitoring

The gateway provides detailed logging:

```
[2024-01-15T10:30:00.000Z] GET /analytics/dashboard
Query: { period: '30d' }
Headers: { authorization: '[PRESENT]' }

--- Outgoing Response ---
Status: 200
Duration: 125ms
```

## Security

- **Helmet.js**: Adds security headers
- **CORS**: Configurable CORS policies
- **Rate Limiting**: Protection against abuse
- **JWT Validation**: Secure token verification
- **Input Sanitization**: Automatic sanitization of sensitive data in logs
- **Error Sanitization**: Production mode hides internal error details

## Graceful Shutdown

The gateway handles shutdown signals gracefully:

```bash
# Shutdown with cleanup
SIGTERM or SIGINT (Ctrl+C)
```

The gateway will:
1. Stop accepting new connections
2. Wait for existing requests to complete (max 30s)
3. Close all connections
4. Exit cleanly

## Testing

```bash
# Run linter
npm run lint

# Run tests (when implemented)
npm test
```

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Use a strong `JWT_SECRET` (minimum 32 characters)
3. Configure appropriate `CORS_ORIGIN`
4. Set up proper logging aggregation (e.g., CloudWatch, DataDog)
5. Use a process manager (PM2, systemd)
6. Set up monitoring and alerting
7. Configure reverse proxy (Nginx, Apache)

## Troubleshooting

### Service Unavailable Errors

Check that all downstream services are running:

```bash
curl http://localhost:4000/api-gateway/health
```

### Rate Limit Issues

Adjust rate limits in `src/middleware/rate-limit.middleware.ts` or via environment variables.

### Authentication Failures

Verify JWT_SECRET matches between gateway and auth service.

## License

MIT
