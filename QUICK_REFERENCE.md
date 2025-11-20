# 🎯 CC3 Dashboard - Quick Reference Card

**Keep this open for instant access to commands!**

---

## ⚡ FASTEST WAY TO START (Docker)

```bash
cd /Users/jaiadithyaramnayani/Desktop/CC3
docker-compose up -d
```

**Wait 30 seconds, then open:** http://localhost:3000

**Login:** `admin@healthcare.com` / `Admin@2024`

---

## 🎮 Essential Commands

### Start Everything
```bash
docker-compose up -d          # Docker (recommended)
npm run dev                   # Manual (all services)
```

### Stop Everything
```bash
docker-compose down           # Docker
Ctrl + C                      # Manual
```

### View Logs
```bash
docker-compose logs -f        # All services
docker-compose logs -f frontend   # Just frontend
```

### Check Status
```bash
docker-compose ps             # See what's running
./scripts/health-check.sh     # Health check all services
```

### Fresh Start (Clean Slate)
```bash
docker-compose down -v        # Stop and remove data
docker-compose up -d          # Start fresh
```

---

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main dashboard |
| **API Gateway** | http://localhost:4000 | API entry point |
| Auth Service | http://localhost:4001 | Authentication |
| Analytics Service | http://localhost:4002 | KPI calculations |
| Data Service | http://localhost:4003 | CRUD operations |
| Reporting Service | http://localhost:4004 | Export/Reports |

---

## 🔑 Login Credentials

```bash
# Admin (Full Access)
admin@healthcare.com / Admin@2024

# Executive (Reports & Dashboards)
executive@healthcare.com / Exec@2024

# Analyst (Analytics & Exports)
analyst@healthcare.com / Analyst@2024

# Manager (Facility-Specific)
manager@healthcare.com / Manager@2024
```

---

## 🎨 New Features to Try

1. **🌗 Dark Mode** - Click sun/moon icon (top-right)
2. **🔔 Notifications** - Watch for toast messages
3. **⏳ Skeletons** - Beautiful loading states
4. **📤 JSON Export** - New export format option

---

## 🐛 Quick Fixes

### Port Already in Use
```bash
lsof -i :3000              # Find what's using port 3000
kill -9 <PID>              # Kill the process
```

### Database Issues
```bash
docker-compose restart postgres   # Restart database
docker-compose logs postgres      # Check logs
```

### Module Not Found
```bash
npm run clean:install      # Clean reinstall
npm run generate           # Generate Prisma client
```

### Docker Build Issues
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Development Commands

### Database
```bash
npm run migrate            # Run migrations
npm run seed               # Seed sample data
npm run generate           # Generate Prisma client
npm run studio             # Open Prisma Studio
```

### Testing
```bash
npm test                   # Run all tests
npm run test:e2e           # E2E tests
npm run test:coverage      # Coverage report
```

### Linting
```bash
npm run lint               # Lint all code
npm run format             # Format code
```

---

## 🎬 Typical Workflow

### First Time Setup
```bash
cd /Users/jaiadithyaramnayani/Desktop/CC3
cp .env.example .env
docker-compose up -d
# Wait 30 seconds
# Open http://localhost:3000
```

### Daily Development
```bash
# Start
docker-compose up -d

# Make changes to code (hot-reload enabled)

# View logs if needed
docker-compose logs -f

# Stop when done
docker-compose down
```

### Fresh Database
```bash
docker-compose down -v     # Remove old data
docker-compose up -d       # Start services
npm run migrate            # Run migrations
npm run seed               # Add fresh data
```

---

## 🚨 Emergency Commands

### Kill Everything
```bash
docker-compose down -v
docker system prune -a
killall node
```

### Complete Reset
```bash
# Remove everything
rm -rf node_modules frontend/node_modules backend/*/node_modules
docker-compose down -v
docker system prune -a

# Start fresh
npm run install:all
docker-compose up -d
npm run migrate
npm run seed
```

---

## 📱 Quick Navigation

**In the Dashboard:**
- **Dashboard** → Main KPI overview
- **Analytics** → Detailed analytics
- **Reports** → Mock Power BI reports
- **Admin** → User management (admin only)
- **Profile** → Click avatar (top-right)
- **Dark Mode** → Click sun/moon icon
- **Logout** → Profile menu → Logout

---

## 💡 Pro Tips

✨ **First time?** Use Docker - it's the easiest!

🔧 **Developing?** Run services in separate terminals for better debugging

🐛 **Stuck?** Check logs first: `docker-compose logs -f`

🔄 **Need fresh start?** `docker-compose down -v && docker-compose up -d`

⚡ **Port conflict?** Change ports in `.env` file

📊 **Want to see data?** Run `npm run studio` for Prisma Studio

---

## 📚 Full Documentation

- **[HOW_TO_RUN.md](HOW_TO_RUN.md)** - Complete run guide
- **[FEATURE_DEMO.md](FEATURE_DEMO.md)** - New features walkthrough
- **[README.md](README.md)** - Full project documentation
- **[docs/USER_GUIDE.md](docs/USER_GUIDE.md)** - How to use features
- **[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - API reference

---

## 🎯 Common Tasks

### I want to...

**Start the app quickly**
```bash
docker-compose up -d
```

**See what's happening**
```bash
docker-compose logs -f
```

**Fix "port in use" error**
```bash
lsof -i :3000
kill -9 <PID>
```

**Get fresh data**
```bash
npm run migrate
npm run seed
```

**Stop everything**
```bash
docker-compose down
```

**Completely reset**
```bash
docker-compose down -v
docker-compose up -d
```

---

<div align="center">

## 🚀 Quick Start Right Now!

```bash
cd /Users/jaiadithyaramnayani/Desktop/CC3 && docker-compose up -d
```

**Then open:** http://localhost:3000

**Login:** admin@healthcare.com / Admin@2024

---

**⭐ That's it! You're running!**

</div>

