#!/bin/bash
set -e

echo "=================================="
echo "Financial Analytics Dashboard"
echo "Build Verification Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track status
SUCCESS=0
FAILED=0

# Function to print status
print_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((SUCCESS++))
  else
    echo -e "${RED}✗${NC} $2"
    ((FAILED++))
  fi
}

# 1. Check Node.js and npm
echo "1. Checking Prerequisites"
echo "------------------------"
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  print_status 0 "Node.js installed ($NODE_VERSION)"
else
  print_status 1 "Node.js not found"
fi

if command -v npm &> /dev/null; then
  NPM_VERSION=$(npm --version)
  print_status 0 "npm installed ($NPM_VERSION)"
else
  print_status 1 "npm not found"
fi

if command -v docker &> /dev/null; then
  DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
  print_status 0 "Docker installed ($DOCKER_VERSION)"
else
  echo -e "${YELLOW}⚠${NC} Docker not found (optional for local development)"
fi

echo ""

# 2. Check project structure
echo "2. Verifying Project Structure"
echo "-------------------------------"

# Backend services
SERVICES="shared api-gateway auth-service analytics-service data-service reporting-service"
for service in $SERVICES; do
  if [ -d "backend/$service/src" ]; then
    print_status 0 "Backend service: $service"
  else
    print_status 1 "Backend service: $service"
  fi
done

# Frontend
if [ -d "frontend/src" ]; then
  print_status 0 "Frontend application"
else
  print_status 1 "Frontend application"
fi

echo ""

# 3. Check configuration files
echo "3. Checking Configuration Files"
echo "--------------------------------"

FILES=".env package.json docker-compose.yml backend/shared/prisma/schema.prisma"
for file in $FILES; do
  if [ -f "$file" ]; then
    print_status 0 "$file"
  else
    print_status 1 "$file"
  fi
done

echo ""

# 4. Check Docker files
echo "4. Checking Docker Configuration"
echo "---------------------------------"

DOCKERFILES="api-gateway auth analytics data reporting frontend shared"
for df in $DOCKERFILES; do
  if [ -f "docker/Dockerfile.$df" ]; then
    print_status 0 "Dockerfile.$df"
  else
    print_status 1 "Dockerfile.$df"
  fi
done

if [ -f "docker/nginx.conf" ]; then
  print_status 0 "nginx.conf"
else
  print_status 1 "nginx.conf"
fi

echo ""

# 5. Check documentation
echo "5. Checking Documentation"
echo "-------------------------"

DOCS="README.md QUICKSTART.md docs/SETUP.md docs/USER_GUIDE.md docs/ARCHITECTURE.md docs/API_DOCUMENTATION.md docs/DEPLOYMENT.md"
for doc in $DOCS; do
  if [ -f "$doc" ]; then
    print_status 0 "$doc"
  else
    print_status 1 "$doc"
  fi
done

echo ""

# 6. Count files
echo "6. Project Statistics"
echo "---------------------"

BACKEND_TS=$(find backend -name "*.ts" -type f | wc -l)
FRONTEND_TS=$(find frontend/src -name "*.ts" -o -name "*.tsx" | wc -l)
TOTAL_FILES=$(find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l)

echo "  Backend TypeScript files: $BACKEND_TS"
echo "  Frontend TypeScript files: $FRONTEND_TS"
echo "  Total project files: $TOTAL_FILES"

echo ""

# Summary
echo "=================================="
echo "Summary"
echo "=================================="
echo -e "${GREEN}Passed:${NC} $SUCCESS"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed:${NC} $FAILED"
  echo ""
  echo "Some checks failed. Please review the output above."
  exit 1
else
  echo ""
  echo "All checks passed! ✓"
  echo ""
  echo "Next steps:"
  echo "  1. Install dependencies: npm install --legacy-peer-deps"
  echo "  2. Start PostgreSQL: docker-compose up -d postgres"
  echo "  3. Run migrations: npm run migrate:dev"
  echo "  4. Seed database: npm run seed"
  echo "  5. Start services: npm run dev"
  echo ""
  echo "Or use Docker Compose: docker-compose up"
  exit 0
fi
