# 🚀 Quick Start Guide

Get the Financial Analytics Dashboard running in **5 minutes**!

---

## ⚡ Option 1: Docker Compose (Recommended)

The fastest way to run the entire application with one command.

### Prerequisites
- Docker & Docker Compose installed
- 8GB RAM available
- Ports 3000-5432 available

### Steps

```bash
# 1. Clone repository (if not already)
cd /home/user/CC3

# 2. Start all services
docker-compose up -d

# 3. Wait for services to start (about 30 seconds)
docker-compose ps

# 4. Open browser
http://localhost:3000
```

### Demo Credentials
```
Email: admin@healthcare.com
Password: Admin@2024
```

**That's it!** All services are running:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:4000
- PostgreSQL: localhost:5432

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f api-gateway
```

### Stop Services
```bash
docker-compose down

# With data cleanup
docker-compose down -v
```

---

## 💻 Option 2: Local Development

Run each service individually for development.

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm 10+

### 1. Database Setup

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Or install locally and create database
createdb healthcare_analytics
```

### 2. Install Dependencies

```bash
# Install all services at once
npm run install:all

# Or install individually
cd backend/shared && npm install
cd backend/auth-service && npm install
cd backend/data-service && npm install
cd backend/analytics-service && npm install
cd backend/reporting-service && npm install
cd backend/api-gateway && npm install
cd frontend && npm install
```

### 3. Setup Database

```bash
# Generate Prisma client
cd backend/shared
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database with sample data (50,000+ records)
npm run seed
```

**Expected output:**
```
✅ Created 3 facilities
✅ Created 15 departments
✅ Created 6 payers
✅ Created 50,000+ claims
✅ Created 4 demo users
```

### 4. Start Backend Services

Open 5 separate terminal windows:

```bash
# Terminal 1: Auth Service
cd backend/auth-service
npm run dev
# → http://localhost:4001

# Terminal 2: Data Service
cd backend/data-service
npm run dev
# → http://localhost:4003

# Terminal 3: Analytics Service
cd backend/analytics-service
npm run dev
# → http://localhost:4002

# Terminal 4: Reporting Service
cd backend/reporting-service
npm run dev
# → http://localhost:4004

# Terminal 5: API Gateway
cd backend/api-gateway
npm run dev
# → http://localhost:4000
```

### 5. Start Frontend

```bash
# Terminal 6: Frontend
cd frontend
npm start
# → http://localhost:3000
```

### 6. Open Application

Navigate to: **http://localhost:3000**

Login with:
```
Email: admin@healthcare.com
Password: Admin@2024
```

---

## ✅ Verify Installation

### Health Checks

```bash
# API Gateway
curl http://localhost:4000/health

# Auth Service
curl http://localhost:4001/health

# Analytics Service
curl http://localhost:4002/health

# Data Service
curl http://localhost:4003/health

# Reporting Service
curl http://localhost:4004/health
```

All should return: `{"status":"ok"}`

### Test Authentication

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthcare.com",
    "password": "Admin@2024"
  }'
```

Should return access_token and user info.

### Test Analytics

```bash
# Get JWT token first from login response
TOKEN="your-token-here"

curl http://localhost:4000/analytics/kpis \
  -H "Authorization: Bearer $TOKEN"
```

Should return 17 KPIs with values.

---

## 🎯 What You'll See

### Dashboard
- ✅ 6 KPI cards with real data
- ✅ Revenue trend chart
- ✅ Claims volume chart
- ✅ Date filtering
- ✅ Facility selector

### Reports Page
- ✅ 6 predefined report templates
- ✅ Export to Excel/CSV/PDF

### Analytics Page
- ✅ 4 tabs: Revenue, Payer, Denials, Facilities
- ✅ Detailed breakdowns
- ✅ Interactive charts

### Admin Page (Admin only)
- ✅ User management
- ✅ Create/edit/deactivate users

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000  # or :4000, :4001, etc.

# Kill the process
kill -9 <PID>
```

### Database Connection Error

```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
psql postgresql://postgres:postgres@localhost:5432/healthcare_analytics
```

### Prisma Client Not Generated

```bash
cd backend/shared
npx prisma generate
```

### Frontend Won't Start

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Services Can't Connect

Make sure all services are running and ports are correct:
- API Gateway: 4000
- Auth: 4001
- Analytics: 4002
- Data: 4003
- Reporting: 4004
- Frontend: 3000
- PostgreSQL: 5432

---

## 📊 Sample Data

The seed script creates:

**Facilities (3):**
- General Medical Center (Hospital, 250 beds)
- Downtown Clinic (Clinic, outpatient)
- Riverside Hospital (Small hospital, 75 beds)

**Departments (15 total):**
- Emergency, Cardiology, Orthopedics, Primary Care, Radiology, Surgery

**Payers (6):**
- Medicare, Medicaid, Blue Cross Blue Shield, Aetna, UnitedHealthcare, Self-Pay

**Claims (~50,000):**
- 6 months of historical data
- Realistic status distribution (75% paid, 10% partial, 8% denied, 7% in-process)
- Dates from current date backwards

**Users (4):**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@healthcare.com | Admin@2024 |
| Executive | executive@healthcare.com | Exec@2024 |
| Analyst | analyst@healthcare.com | Analyst@2024 |
| Facility Manager | manager@healthcare.com | Manager@2024 |

---

## 🚀 Next Steps

1. **Explore the Dashboard** - View real-time KPIs
2. **Try Date Filtering** - Switch between presets
3. **Export Data** - Download Excel/CSV/PDF reports
4. **Check Analytics** - Deep dive into each category
5. **Manage Users** - Create/edit users (admin only)

---

## 📚 Additional Resources

- [Complete Setup Guide](docs/SETUP.md)
- [User Guide](docs/USER_GUIDE.md)
- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Documentation](docs/API_DOCUMENTATION.md)

---

## 💡 Tips

**Performance:**
- First KPI load may take 2-3 seconds (calculating from 50K records)
- Subsequent loads are cached (5 min TTL)
- Export generation takes 5-10 seconds

**Development:**
- Use `npm run dev` for hot-reload
- Check logs for errors
- Prisma Studio for database inspection: `npx prisma studio`

**Production:**
- Change JWT_SECRET in .env
- Update CORS_ORIGIN
- Use strong passwords
- Enable HTTPS

---

<div align="center">

**🎉 Enjoy your Financial Analytics Dashboard!**

[Report Issues](https://github.com/yourusername/financial-analytics-dashboard/issues) | [Documentation](README.md)

</div>
