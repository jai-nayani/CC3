# 🚀 How to Run CC3 Financial Analytics Dashboard

**Quick Reference Guide - Get Started in Minutes!**

---

## 📋 Choose Your Method

### ⭐ **Method 1: Docker (Recommended - Easiest)**
Best for: Quick demo, testing, production-like environment

### 🛠️ **Method 2: Manual Development**
Best for: Active development, debugging, code changes

### ⚡ **Method 3: Quick Start Script** 
Best for: Automated setup from scratch

---

## ⭐ Method 1: Docker (RECOMMENDED)

### Prerequisites
- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop/))
- 8GB RAM minimum, 16GB recommended

### Steps

```bash
# 1. Navigate to project directory
cd /Users/jaiadithyaramnayani/Desktop/CC3

# 2. Create environment file (first time only)
cp .env.example .env

# 3. Start everything with ONE command! 🎉
docker-compose up -d

# 4. Wait 30-60 seconds for services to initialize

# 5. Open your browser and go to:
# http://localhost:3000
```

### ✅ What You'll Get:
- ✅ Frontend: http://localhost:3000
- ✅ API Gateway: http://localhost:4000
- ✅ Auth Service: http://localhost:4001
- ✅ Analytics Service: http://localhost:4002
- ✅ Data Service: http://localhost:4003
- ✅ Reporting Service: http://localhost:4004
- ✅ PostgreSQL: localhost:5432
- ✅ Redis: localhost:6379

### Useful Docker Commands

```bash
# View logs (see what's happening)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f api-gateway

# Check service status
docker-compose ps

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart frontend

# Stop and remove everything (clean slate)
docker-compose down -v
```

---

## 🛠️ Method 2: Manual Development

**Best for active development with hot-reload**

### Prerequisites
- Node.js v20+ installed ([Download here](https://nodejs.org/))
- PostgreSQL 15+ installed ([Download here](https://www.postgresql.org/download/))
- npm v10+

### Step-by-Step Setup

#### Step 1: Install Dependencies

```bash
# Navigate to project
cd /Users/jaiadithyaramnayani/Desktop/CC3

# Install all dependencies (takes 2-3 minutes)
npm run install:all
```

#### Step 2: Setup Database

```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# OR use your local PostgreSQL and create database:
# createdb healthcare_analytics

# Run database migrations
npm run migrate

# Generate Prisma client
npm run generate

# Seed sample data (50,000+ records)
npm run seed
```

#### Step 3: Setup Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/healthcare_analytics"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="7d"

# API Gateway
API_GATEWAY_PORT=4000
CORS_ORIGIN="http://localhost:3000"

# Services
AUTH_SERVICE_PORT=4001
ANALYTICS_SERVICE_PORT=4002
DATA_SERVICE_PORT=4003
REPORTING_SERVICE_PORT=4004

# Frontend
FRONTEND_PORT=3000
REACT_APP_API_URL="http://localhost:4000/api/v1"

# Redis (optional)
REDIS_HOST="localhost"
REDIS_PORT=6379
```

#### Step 4: Start All Services

**Option A: Run All Services at Once**

```bash
# Start all backend services + frontend (in one terminal)
npm run dev
```

**Option B: Run Each Service in Separate Terminals** (Better for debugging)

```bash
# Terminal 1 - API Gateway
cd backend/api-gateway
npm run dev

# Terminal 2 - Auth Service
cd backend/auth-service
npm run dev

# Terminal 3 - Analytics Service
cd backend/analytics-service
npm run dev

# Terminal 4 - Data Service
cd backend/data-service
npm run dev

# Terminal 5 - Reporting Service
cd backend/reporting-service
npm run dev

# Terminal 6 - Frontend
cd frontend
npm start
```

#### Step 5: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000

---

## ⚡ Method 3: Quick Start Script

**Automated setup - perfect for first-time setup!**

### Prerequisites
- Bash shell (Mac/Linux/WSL)
- Docker installed
- Node.js v20+ installed

### Steps

```bash
# Navigate to project
cd /Users/jaiadithyaramnayani/Desktop/CC3

# Make script executable
chmod +x scripts/quick-start.sh

# Run the quick start script
./scripts/quick-start.sh
```

### What the Script Does:
1. ✅ Checks prerequisites (Node, Docker, npm)
2. ✅ Installs all dependencies
3. ✅ Starts PostgreSQL with Docker
4. ✅ Runs database migrations
5. ✅ Generates Prisma client
6. ✅ Seeds sample data
7. ✅ Starts all services
8. ✅ Opens browser automatically

---

## 🔑 Demo Login Credentials

Once the app is running, use these credentials to log in:

### Admin Account
```
Email: admin@healthcare.com
Password: Admin@2024
Access: Full system access
```

### Executive Account
```
Email: executive@healthcare.com
Password: Exec@2024
Access: All dashboards and reports
```

### Analyst Account
```
Email: analyst@healthcare.com
Password: Analyst@2024
Access: Analytics and exports
```

### Facility Manager
```
Email: manager@healthcare.com
Password: Manager@2024
Access: Single facility view
```

---

## 🎨 New Features to Try!

### 1. 🌗 Dark Mode
- Click the **sun/moon icon** in the top-right corner
- Theme preference is automatically saved

### 2. 🔔 Toast Notifications
- Watch for notifications when you:
  - Login/Logout
  - Export reports
  - Encounter errors
  - Complete actions

### 3. ⏳ Loading Skeletons
- Beautiful loading animations while data loads
- No more blank screens!

### 4. 📤 Multi-Format Exports
- Export data as:
  - Excel (.xlsx)
  - CSV (.csv)
  - PDF (.pdf)
  - **NEW!** JSON (.json)

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

```bash
# Find what's using the port (Mac/Linux)
lsof -i :3000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or change the port in .env file
FRONTEND_PORT=3001
API_GATEWAY_PORT=4001
```

### Issue: Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

### Issue: "Cannot find module" Errors

```bash
# Clean install all dependencies
npm run clean:install

# Or manually:
rm -rf node_modules frontend/node_modules backend/*/node_modules
npm run install:all
```

### Issue: Prisma Client Not Generated

```bash
# Navigate to shared folder and generate
cd backend/shared
npx prisma generate

# Or from root:
npm run generate
```

### Issue: Docker Build Fails

```bash
# Clean Docker cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

---

## 🧪 Verify Everything is Working

### Health Check Script

```bash
# Run health check to verify all services
./scripts/health-check.sh
```

Expected output:
```
✅ Frontend (http://localhost:3000) - OK
✅ API Gateway (http://localhost:4000) - OK
✅ Auth Service (http://localhost:4001) - OK
✅ Analytics Service (http://localhost:4002) - OK
✅ Data Service (http://localhost:4003) - OK
✅ Reporting Service (http://localhost:4004) - OK
✅ PostgreSQL - OK
```

### Manual Health Checks

```bash
# Check API Gateway
curl http://localhost:4000/health

# Check Frontend is serving
curl http://localhost:3000

# Check database connection
docker exec financial-analytics-postgres psql -U postgres -c "SELECT 1;"
```

---

## 📊 Monitoring Services

### View Service Logs

**Docker Method:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f api-gateway
```

**Manual Method:**
```bash
# Logs are shown in each terminal window where services are running
```

### Check Service Status

```bash
# Docker
docker-compose ps

# Manual - check if ports are listening
lsof -i :3000  # Frontend
lsof -i :4000  # API Gateway
lsof -i :4001  # Auth Service
lsof -i :4002  # Analytics Service
lsof -i :4003  # Data Service
lsof -i :4004  # Reporting Service
```

---

## 🛑 Stopping the Application

### Docker Method

```bash
# Stop all services (keep data)
docker-compose down

# Stop and remove all data (clean slate)
docker-compose down -v
```

### Manual Method

```bash
# Press Ctrl+C in each terminal window where services are running

# Or if running with npm run dev:
# Press Ctrl+C once to stop all services
```

---

## 🚀 Next Steps

After running the application:

1. **Explore the Dashboard** - View 17+ KPIs with real-time data
2. **Try Dark Mode** - Toggle between light and dark themes
3. **Filter Data** - Use date filters and facility selectors
4. **Export Reports** - Download data in multiple formats
5. **View Analytics** - Explore revenue trends and A/R aging
6. **Check Mock Power BI** - View embedded analytical reports

---

## 📚 Additional Resources

- **[User Guide](docs/USER_GUIDE.md)** - How to use every feature
- **[API Documentation](docs/API_DOCUMENTATION.md)** - API reference
- **[Architecture](docs/ARCHITECTURE.md)** - System design
- **[Feature Demo](FEATURE_DEMO.md)** - New features walkthrough
- **[Setup Guide](docs/SETUP.md)** - Detailed setup instructions

---

## 💡 Quick Tips

1. **First time running?** Use Docker method for easiest setup
2. **Developing features?** Use manual method with separate terminals
3. **Port conflicts?** Change ports in `.env` file
4. **Fresh start needed?** Run `docker-compose down -v && docker-compose up -d`
5. **Check logs** if something isn't working
6. **Use health-check script** to verify all services are running

---

## 🎉 You're All Set!

Your CC3 Financial Analytics Dashboard should now be running!

**Quick Access:**
- 🌐 **Dashboard**: http://localhost:3000
- 🔑 **Login**: admin@healthcare.com / Admin@2024
- 📊 **API**: http://localhost:4000

---

<div align="center">

**Need Help?** Check the troubleshooting section or view the full documentation.

**Enjoying the dashboard?** Give us a ⭐ on GitHub!

[⬆ Back to Top](#-how-to-run-cc3-financial-analytics-dashboard)

</div>

