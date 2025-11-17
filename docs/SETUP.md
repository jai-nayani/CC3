# 🚀 Setup Guide

Complete installation and configuration guide for the Financial Analytics Dashboard.

---

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Installation Methods](#-installation-methods)
  - [Docker Setup (Recommended)](#-method-1-docker-setup-recommended)
  - [Local Development Setup](#-method-2-local-development-setup)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Verification](#-verification)
- [Troubleshooting](#-troubleshooting)
- [Next Steps](#-next-steps)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

| Software | Version | Purpose | Download Link |
|----------|---------|---------|---------------|
| **Node.js** | 20.x or higher | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| **npm** | 10.x or higher | Package manager | Comes with Node.js |
| **Docker** | 24.x or higher | Containerization | [docker.com](https://www.docker.com/) |
| **Docker Compose** | 2.x or higher | Multi-container orchestration | Comes with Docker Desktop |
| **Git** | 2.x or higher | Version control | [git-scm.com](https://git-scm.com/) |

### Optional Software

| Software | Version | Purpose | Download Link |
|----------|---------|---------|---------------|
| **PostgreSQL** | 15.x | Database (if not using Docker) | [postgresql.org](https://www.postgresql.org/) |
| **Postman** | Latest | API testing | [postman.com](https://www.postman.com/) |
| **VS Code** | Latest | Code editor | [code.visualstudio.com](https://code.visualstudio.com/) |

### System Requirements

- **OS**: Windows 10+, macOS 12+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 8GB, Recommended 16GB
- **Disk Space**: At least 5GB free
- **CPU**: Multi-core processor recommended

### Verify Installations

Run these commands to verify your setup:

```bash
# Check Node.js version
node --version
# Expected: v20.x.x or higher

# Check npm version
npm --version
# Expected: 10.x.x or higher

# Check Docker version
docker --version
# Expected: Docker version 24.x.x or higher

# Check Docker Compose version
docker-compose --version
# Expected: Docker Compose version 2.x.x or higher

# Check Git version
git --version
# Expected: git version 2.x.x or higher
```

---

## 🛠️ Installation Methods

Choose one of the following installation methods based on your preference.

---

## 🐳 Method 1: Docker Setup (Recommended)

The easiest and fastest way to get started. All services run in isolated containers.

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/financial-analytics-dashboard.git

# Navigate to the project directory
cd financial-analytics-dashboard
```

### Step 2: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your preferred editor
nano .env  # or use: code .env, vim .env, etc.
```

**Important Variables to Configure:**

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/healthcare_analytics"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=healthcare_analytics

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h

# Application Ports
API_GATEWAY_PORT=4000
AUTH_SERVICE_PORT=4001
ANALYTICS_SERVICE_PORT=4002
DATA_SERVICE_PORT=4003
REPORTING_SERVICE_PORT=4004
FRONTEND_PORT=3000

# Node Environment
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Build and Start All Services

```bash
# Build all Docker images
docker-compose build

# Start all services in detached mode
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

**What This Does:**
- Builds Docker images for all microservices
- Starts PostgreSQL database container
- Runs database migrations automatically
- Seeds the database with sample data
- Starts all 5 microservices
- Starts the React frontend

### Step 4: Verify Services Are Running

```bash
# Check container status
docker-compose ps

# Expected output:
# NAME                          STATUS              PORTS
# financial-analytics-postgres  Up                  0.0.0.0:5432->5432/tcp
# financial-analytics-gateway   Up                  0.0.0.0:4000->4000/tcp
# financial-analytics-auth      Up                  0.0.0.0:4001->4001/tcp
# financial-analytics-analytics Up                  0.0.0.0:4002->4002/tcp
# financial-analytics-data      Up                  0.0.0.0:4003->4003/tcp
# financial-analytics-reporting Up                  0.0.0.0:4004->4004/tcp
# financial-analytics-frontend  Up                  0.0.0.0:3000->3000/tcp
```

### Step 5: Access the Application

Open your browser and navigate to:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:4000](http://localhost:4000)

**Done! Skip to [Verification](#-verification) section.**

---

## 💻 Method 2: Local Development Setup

For developers who prefer running services locally without Docker.

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/financial-analytics-dashboard.git

# Navigate to the project directory
cd financial-analytics-dashboard
```

### Step 2: Install PostgreSQL

**Option A: Install PostgreSQL Locally**

Follow the official guide for your OS:
- **macOS**: Use Homebrew: `brew install postgresql@15`
- **Ubuntu**: `sudo apt install postgresql-15`
- **Windows**: Download installer from [postgresql.org](https://www.postgresql.org/download/)

**Option B: Use Docker for PostgreSQL Only**

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Verify it's running
docker ps | grep postgres
```

### Step 3: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE healthcare_analytics;

# Create user (if needed)
CREATE USER healthcare_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE healthcare_analytics TO healthcare_user;

# Exit psql
\q
```

### Step 4: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file
nano .env
```

**Update the DATABASE_URL for local PostgreSQL:**

```env
# If using localhost PostgreSQL
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/healthcare_analytics"

# If using Docker PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/healthcare_analytics"
```

### Step 5: Install Dependencies

```bash
# Install dependencies for all services
npm run install:all

# Or install individually:
cd backend/api-gateway && npm install && cd ../..
cd backend/auth-service && npm install && cd ../..
cd backend/analytics-service && npm install && cd ../..
cd backend/data-service && npm install && cd ../..
cd backend/reporting-service && npm install && cd ../..
cd backend/shared && npm install && cd ../..
cd frontend && npm install && cd ..
```

### Step 6: Run Database Migrations

```bash
# Navigate to the shared backend folder
cd backend/shared

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Return to root
cd ../..
```

### Step 7: Seed the Database

```bash
# Run the seed script
npm run seed

# You should see output like:
# ✓ Created 3 facilities
# ✓ Created 5 departments per facility
# ✓ Created 6 payer types
# ✓ Created 50,000+ transactions
# ✓ Created 4 demo users
# ✓ Database seeded successfully!
```

### Step 8: Start All Services

**Option A: Start All Services Concurrently**

```bash
# Start all services and frontend
npm run dev

# This runs all microservices and the frontend simultaneously
```

**Option B: Start Services Individually**

Open separate terminal windows for each:

```bash
# Terminal 1: API Gateway
cd backend/api-gateway
npm run dev

# Terminal 2: Auth Service
cd backend/auth-service
npm run dev

# Terminal 3: Analytics Service
cd backend/analytics-service
npm run dev

# Terminal 4: Data Service
cd backend/data-service
npm run dev

# Terminal 5: Reporting Service
cd backend/reporting-service
npm run dev

# Terminal 6: Frontend
cd frontend
npm start
```

### Step 9: Access the Application

Open your browser and navigate to:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:4000](http://localhost:4000)

---

## ⚙️ Configuration

### Environment Variables Reference

#### Database Configuration

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Individual PostgreSQL variables (for Docker Compose)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=healthcare_analytics
```

#### JWT Authentication

```env
# Secret key for signing JWT tokens (change in production!)
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Token expiration time
JWT_EXPIRATION=24h  # Options: 1h, 24h, 7d, etc.

# Refresh token expiration
JWT_REFRESH_EXPIRATION=7d
```

#### Service Ports

```env
# API Gateway (main entry point)
API_GATEWAY_PORT=4000

# Microservice ports
AUTH_SERVICE_PORT=4001
ANALYTICS_SERVICE_PORT=4002
DATA_SERVICE_PORT=4003
REPORTING_SERVICE_PORT=4004

# Frontend port
FRONTEND_PORT=3000

# PostgreSQL port
POSTGRES_PORT=5432
```

#### Application Settings

```env
# Environment mode
NODE_ENV=development  # Options: development, production, test

# CORS allowed origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:4000

# Rate limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# Logging level
LOG_LEVEL=info  # Options: error, warn, info, debug

# Session settings
SESSION_SECRET=your-session-secret-key
SESSION_TIMEOUT=1800000  # 30 minutes in milliseconds
```

#### Feature Flags

```env
# Enable/disable features
ENABLE_ANALYTICS=true
ENABLE_EXPORTS=true
ENABLE_ALERTS=true
ENABLE_MOCK_POWERBI=true
```

---

## 🗄️ Database Setup

### Understanding the Schema

The database uses an **OLAP (Online Analytical Processing)** design optimized for analytics queries:

```
┌─────────────────────────────────────────────────────────────┐
│                     DIMENSION TABLES                         │
├─────────────────────────────────────────────────────────────┤
│  Facilities  │  Departments  │  Payers  │  Users  │  Dates │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       FACT TABLES                            │
├─────────────────────────────────────────────────────────────┤
│  • Claims (transactions)                                     │
│  • Payments                                                  │
│  • Adjustments                                               │
│  • Denials                                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  MATERIALIZED VIEWS                          │
├─────────────────────────────────────────────────────────────┤
│  • Monthly KPIs (pre-aggregated)                            │
│  • Facility Performance                                      │
│  • Payer Mix Analytics                                       │
└─────────────────────────────────────────────────────────────┘
```

### Migration Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### Database Management

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio
# Access at: http://localhost:5555

# View database schema
npx prisma db pull

# Generate Prisma client
npx prisma generate
```

### Backup and Restore

**Create Backup:**

```bash
# Using Docker
docker exec financial-analytics-postgres pg_dump -U postgres healthcare_analytics > backup.sql

# Using local PostgreSQL
pg_dump -U postgres healthcare_analytics > backup.sql
```

**Restore Backup:**

```bash
# Using Docker
docker exec -i financial-analytics-postgres psql -U postgres healthcare_analytics < backup.sql

# Using local PostgreSQL
psql -U postgres healthcare_analytics < backup.sql
```

---

## ▶️ Running the Application

### Development Mode

```bash
# Start all services with hot-reload
npm run dev

# Start individual service
npm run dev:auth
npm run dev:analytics
npm run dev:data
npm run dev:reporting
npm run dev:gateway
npm run dev:frontend
```

### Production Mode

```bash
# Build all services
npm run build

# Start in production mode
npm run start

# Using Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Useful Commands

```bash
# View logs
npm run logs

# Stop all services
npm run stop

# Restart services
npm run restart

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

---

## ✅ Verification

### 1. Check Service Health

**API Gateway Health Check:**

```bash
curl http://localhost:4000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-11-17T12:00:00.000Z",
  "services": {
    "auth": "healthy",
    "analytics": "healthy",
    "data": "healthy",
    "reporting": "healthy"
  }
}
```

**Individual Service Health:**

```bash
# Auth Service
curl http://localhost:4001/health

# Analytics Service
curl http://localhost:4002/health

# Data Service
curl http://localhost:4003/health

# Reporting Service
curl http://localhost:4004/health
```

### 2. Test Database Connection

```bash
# Connect to PostgreSQL
psql -U postgres -d healthcare_analytics

# Run a test query
SELECT COUNT(*) FROM claims;
# Should return ~50,000+ records

# Exit
\q
```

### 3. Test Authentication

```bash
# Login with demo credentials
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthcare.com",
    "password": "Admin@2024"
  }'

# Expected response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@healthcare.com",
    "role": "ADMIN",
    "name": "Admin User"
  }
}
```

### 4. Test Analytics Endpoint

```bash
# Get KPIs (replace TOKEN with your access token)
curl -X GET http://localhost:4000/analytics/kpis \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected response:
{
  "grossRevenue": 12500000.50,
  "netRevenue": 10200000.25,
  "collectionRate": 95.5,
  "daysInAR": 42.3,
  "denialRate": 8.2,
  ...
}
```

### 5. Access Frontend

1. Open browser to [http://localhost:3000](http://localhost:3000)
2. You should see the login page
3. Log in with demo credentials:
   - Email: `admin@healthcare.com`
   - Password: `Admin@2024`
4. You should see the dashboard with KPI cards and charts

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Find process using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 PID  # macOS/Linux
taskkill /PID PID /F  # Windows

# Or change the port in .env
FRONTEND_PORT=3001
```

#### Issue 2: Database Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it
docker-compose up -d postgres

# Check logs
docker-compose logs postgres

# Verify DATABASE_URL in .env is correct
echo $DATABASE_URL
```

#### Issue 3: Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**

```bash
# Navigate to shared folder
cd backend/shared

# Generate Prisma client
npx prisma generate

# Restart services
cd ../..
npm run restart
```

#### Issue 4: Docker Build Fails

**Error:** `failed to solve with frontend dockerfile.v0`

**Solution:**

```bash
# Clean Docker cache
docker system prune -a

# Remove existing images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose build --no-cache

# Start services
docker-compose up -d
```

#### Issue 5: Frontend Shows Blank Page

**Solution:**

```bash
# Check console for errors
# Open browser DevTools (F12)

# Clear cache and hard reload
# Chrome/Edge: Ctrl+Shift+R
# Firefox: Ctrl+F5

# Rebuild frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

#### Issue 6: JWT Token Invalid

**Error:** `Unauthorized: Invalid token`

**Solution:**

```bash
# Ensure JWT_SECRET matches across all services
# Check .env file

# Clear browser localStorage
# In browser console:
localStorage.clear()

# Re-login to get new token
```

#### Issue 7: Sample Data Not Loading

**Error:** `Database is empty after seeding`

**Solution:**

```bash
# Re-run seed script
npm run seed

# Or manually run:
cd backend/shared
npx ts-node database/seeds/index.ts

# Verify data
psql -U postgres -d healthcare_analytics
SELECT COUNT(*) FROM claims;
```

### Getting Help

If you encounter issues not listed here:

1. **Check logs**: `docker-compose logs -f` or `npm run logs`
2. **Search issues**: [GitHub Issues](https://github.com/yourusername/financial-analytics-dashboard/issues)
3. **Create new issue**: Provide logs, environment details, and steps to reproduce
4. **Join Discord**: [Community Server](https://discord.gg/healthcare-analytics)

---

## 🎯 Next Steps

After successful installation, check out these resources:

1. **[User Guide](USER_GUIDE.md)** - Learn how to use all features
2. **[Architecture Documentation](ARCHITECTURE.md)** - Understand the system design
3. **[API Documentation](API_DOCUMENTATION.md)** - Explore the REST API
4. **[Deployment Guide](DEPLOYMENT.md)** - Deploy to AWS/production

### Recommended Learning Path

1. ✅ Complete setup (you are here!)
2. 📖 Read the [User Guide](USER_GUIDE.md) to understand features
3. 🔍 Explore the dashboard with demo credentials
4. 🧪 Try the API endpoints with Postman
5. 🏗️ Review [Architecture](ARCHITECTURE.md) to understand the code
6. 🚀 Deploy to production using [Deployment Guide](DEPLOYMENT.md)

---

## 📞 Support

Need help with setup?

- 📧 Email: support@healthcare-analytics.com
- 💬 Discord: [Join Community](https://discord.gg/healthcare-analytics)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/financial-analytics-dashboard/issues)
- 📖 Docs: [Full Documentation](../README.md)

---

<div align="center">

**Ready to explore the application?**

[← Back to README](../README.md) | [User Guide →](USER_GUIDE.md)

</div>
