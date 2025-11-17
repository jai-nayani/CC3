# 📡 API Documentation

Complete REST API reference for the Financial Analytics Dashboard.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Authentication](#-authentication)
- [Base URL](#-base-url)
- [Common Parameters](#-common-parameters)
- [Response Format](#-response-format)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Endpoints](#-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Analytics](#analytics-endpoints)
  - [Data](#data-endpoints)
  - [Reporting](#reporting-endpoints)
  - [User Management](#user-management-endpoints)
- [Examples](#-examples)
- [SDKs](#-sdks)

---

## 🎯 Overview

The Financial Analytics Dashboard API is a RESTful API that provides access to healthcare revenue analytics data, KPI calculations, and reporting capabilities.

**API Version:** 1.0.0

**Base URL:** `http://localhost:4000/api/v1`

**Response Format:** JSON

**Authentication:** JWT Bearer Token

---

## 🔐 Authentication

All API requests (except `/auth/login` and `/auth/register`) require authentication via JWT Bearer token.

### Obtaining a Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@healthcare.com",
  "password": "Admin@2024"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "uuid-here",
    "email": "admin@healthcare.com",
    "role": "ADMIN",
    "name": "Admin User"
  }
}
```

### Using the Token

Include the access token in the `Authorization` header:

```http
GET /analytics/kpis
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

When the access token expires, use the refresh token:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🌐 Base URL

| Environment | Base URL |
|-------------|----------|
| **Development** | `http://localhost:4000/api/v1` |
| **Staging** | `https://staging-api.healthcare-analytics.com/api/v1` |
| **Production** | `https://api.healthcare-analytics.com/api/v1` |

---

## 📝 Common Parameters

Many endpoints support these common query parameters:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `facilityId` | UUID | Filter by facility | `?facilityId=abc-123` |
| `startDate` | ISO 8601 | Start of date range | `?startDate=2024-01-01` |
| `endDate` | ISO 8601 | End of date range | `?endDate=2024-12-31` |
| `page` | Integer | Page number (1-indexed) | `?page=1` |
| `limit` | Integer | Items per page (max 100) | `?limit=50` |
| `sort` | String | Sort field | `?sort=createdAt` |
| `order` | String | Sort order (asc/desc) | `?order=desc` |

---

## 📤 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-11-17T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "totalPages": 25,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

---

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-11-17T12:00:00.000Z",
    "requestId": "req-uuid"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## 🚦 Rate Limiting

**Limits:**
- **100 requests** per **15 minutes** per IP address
- **1000 requests** per **hour** per user

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

**Rate Limit Exceeded Response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 5 minutes."
  }
}
```

---

## 🔌 Endpoints

### Authentication Endpoints

#### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123",
  "name": "John Doe",
  "role": "ANALYST"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "ANALYST"
    }
  }
}
```

---

#### POST /auth/login

Authenticate and receive JWT tokens.

**Request:**
```json
{
  "email": "admin@healthcare.com",
  "password": "Admin@2024"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "admin@healthcare.com",
      "role": "ADMIN",
      "name": "Admin User"
    }
  }
}
```

---

#### POST /auth/refresh

Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbG..."
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbG...",
    "expires_in": 3600
  }
}
```

---

#### POST /auth/logout

Logout and invalidate tokens.

**Headers:** `Authorization: Bearer {token}`

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

#### GET /auth/profile

Get current user profile.

**Headers:** `Authorization: Bearer {token}`

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@healthcare.com",
    "name": "Admin User",
    "role": "ADMIN",
    "facilityAccess": ["facility-1", "facility-2"],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Analytics Endpoints

#### GET /analytics/kpis

Get all Key Performance Indicators.

**Query Parameters:**
- `facilityId` (optional): Filter by facility
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)
- `compare` (optional): Include comparison data

**Example Request:**
```http
GET /analytics/kpis?facilityId=abc-123&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "kpis": [
      {
        "name": "Gross Revenue",
        "key": "grossRevenue",
        "value": 12500000.50,
        "unit": "currency",
        "trend": "up",
        "percentChange": 5.2,
        "sparkline": [11800000, 12000000, 12200000, 12500000],
        "previousValue": 11875000.25
      },
      {
        "name": "Collection Rate",
        "key": "collectionRate",
        "value": 95.5,
        "unit": "percentage",
        "trend": "up",
        "percentChange": 1.6,
        "sparkline": [93, 94, 94.5, 95.5],
        "previousValue": 93.9
      }
    ],
    "dateRange": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-12-31T23:59:59.999Z"
    },
    "lastUpdated": "2024-11-17T12:00:00.000Z"
  }
}
```

---

#### GET /analytics/revenue

Get detailed revenue metrics.

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "grossRevenue": 12500000.50,
    "netRevenue": 10200000.25,
    "adjustments": 2300000.25,
    "writeOffs": 500000.00,
    "byFacility": [
      {
        "facilityId": "facility-1",
        "facilityName": "General Medical Center",
        "grossRevenue": 7000000.00,
        "netRevenue": 5600000.00
      }
    ],
    "byMonth": [
      {
        "month": "2024-01",
        "grossRevenue": 1050000.00,
        "netRevenue": 850000.00
      }
    ]
  }
}
```

---

#### GET /analytics/collections

Get collections and A/R metrics.

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "collectionRate": 95.5,
    "daysInAR": 42.3,
    "outstandingBalance": 3500000.00,
    "cashCollections": 9750000.00,
    "arAging": {
      "0-30": 2100000.00,
      "31-60": 700000.00,
      "61-90": 350000.00,
      "91-120": 175000.00,
      "120+": 175000.00
    }
  }
}
```

---

#### GET /analytics/claims

Get claims performance metrics.

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "totalClaims": 52341,
    "cleanClaimRate": 92.5,
    "denialRate": 7.5,
    "denialRecoveryRate": 65.0,
    "claimVolume": {
      "submitted": 52341,
      "accepted": 48415,
      "denied": 3926,
      "pending": 1500
    },
    "topDenialReasons": [
      {
        "reason": "Missing Authorization",
        "count": 1200,
        "percentage": 30.6
      },
      {
        "reason": "Coding Error",
        "count": 800,
        "percentage": 20.4
      }
    ]
  }
}
```

---

#### GET /analytics/trends

Get trend analysis and forecasting.

**Query Parameters:**
- `metric` (required): KPI to analyze
- `period` (optional): Forecast period (default: 3 months)

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "metric": "grossRevenue",
    "historical": [
      { "date": "2024-01", "value": 1050000 },
      { "date": "2024-02", "value": 1100000 },
      { "date": "2024-03", "value": 1150000 }
    ],
    "forecast": [
      { "date": "2024-12", "value": 1300000, "confidence": 90 },
      { "date": "2025-01", "value": 1350000, "confidence": 85 },
      { "date": "2025-02", "value": 1400000, "confidence": 80 }
    ],
    "trend": "increasing",
    "growthRate": 5.2
  }
}
```

---

### Data Endpoints

#### GET /data/claims

Get claims list with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `facilityId` (optional): Filter by facility
- `status` (optional): Filter by status
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "claim-uuid",
      "facilityId": "facility-1",
      "facilityName": "General Medical Center",
      "patientId": "12345",
      "patientName": "John Doe",
      "serviceDate": "2024-11-15T00:00:00.000Z",
      "grossAmount": 5000.00,
      "netAmount": 4000.00,
      "paymentAmount": 3800.00,
      "outstandingAmount": 200.00,
      "status": "PARTIAL_PAYMENT",
      "payerName": "Medicare",
      "createdAt": "2024-11-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 52341,
    "totalPages": 1047
  }
}
```

---

#### POST /data/claims

Create a new claim.

**Request:**
```json
{
  "facilityId": "facility-1",
  "departmentId": "dept-1",
  "payerId": "payer-1",
  "patientId": "12345",
  "patientName": "John Doe",
  "serviceDate": "2024-11-17",
  "grossAmount": 5000.00,
  "adjustmentAmount": 1000.00,
  "netAmount": 4000.00
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "claim-uuid",
    "facilityId": "facility-1",
    "status": "DRAFT",
    "createdAt": "2024-11-17T12:00:00.000Z"
  }
}
```

---

#### GET /data/facilities

Get facilities list.

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "facility-1",
      "name": "General Medical Center",
      "type": "HOSPITAL",
      "bedCount": 250,
      "city": "San Francisco",
      "state": "CA"
    },
    {
      "id": "facility-2",
      "name": "Downtown Clinic",
      "type": "CLINIC",
      "city": "San Francisco",
      "state": "CA"
    }
  ]
}
```

---

### Reporting Endpoints

#### POST /reports/pdf

Generate PDF report.

**Request:**
```json
{
  "template": "dashboard",
  "filters": {
    "facilityId": "facility-1",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "options": {
    "includeCharts": true,
    "includeRawData": false
  }
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "jobId": "job-uuid",
    "status": "processing",
    "estimatedTime": 30
  }
}
```

**Check Status:**
```http
GET /reports/status/{jobId}
```

**Download:**
```http
GET /reports/download/{jobId}
```

---

#### POST /reports/excel

Generate Excel report.

**Request:**
```json
{
  "sheets": ["kpis", "revenue", "claims"],
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

**Response: 200 OK** (same as PDF)

---

### User Management Endpoints

*(Admin Only)*

#### GET /users

Get users list.

**Response: 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "email": "admin@healthcare.com",
      "name": "Admin User",
      "role": "ADMIN",
      "isActive": true,
      "lastLogin": "2024-11-17T10:00:00.000Z"
    }
  ]
}
```

---

#### POST /users

Create new user.

**Request:**
```json
{
  "email": "newuser@healthcare.com",
  "name": "New User",
  "role": "ANALYST",
  "facilityAccess": ["facility-1"]
}
```

**Response: 201 Created**

---

## 📚 Examples

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthcare.com","password":"Admin@2024"}'
```

**Get KPIs:**
```bash
curl http://localhost:4000/api/v1/analytics/kpis \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/TypeScript Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const { data } = await api.post('/auth/login', {
  email: 'admin@healthcare.com',
  password: 'Admin@2024'
});

// Set token for future requests
api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

// Get KPIs
const kpis = await api.get('/analytics/kpis', {
  params: {
    facilityId: 'facility-1',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }
});

console.log(kpis.data);
```

### Python Example

```python
import requests

API_BASE = 'http://localhost:4000/api/v1'

# Login
response = requests.post(f'{API_BASE}/auth/login', json={
    'email': 'admin@healthcare.com',
    'password': 'Admin@2024'
})
token = response.json()['data']['access_token']

# Get KPIs
headers = {'Authorization': f'Bearer {token}'}
params = {
    'facilityId': 'facility-1',
    'startDate': '2024-01-01',
    'endDate': '2024-12-31'
}
kpis = requests.get(f'{API_BASE}/analytics/kpis', headers=headers, params=params)
print(kpis.json())
```

---

## 🛠️ SDKs

Official SDKs coming soon for:
- JavaScript/TypeScript
- Python
- C#
- Java

---

<div align="center">

**Need help with the API?**

[← Back to README](../README.md) | [Architecture →](ARCHITECTURE.md) | [User Guide →](USER_GUIDE.md)

</div>
