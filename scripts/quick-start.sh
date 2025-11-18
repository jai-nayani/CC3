#!/bin/bash
set -e

echo "=================================="
echo "Financial Analytics Dashboard"
echo "Quick Start Script"
echo "=================================="
echo ""
echo "This script will:"
echo "  1. Install all dependencies"
echo "  2. Start PostgreSQL with Docker"
echo "  3. Run database migrations"
echo "  4. Seed the database with sample data"
echo "  5. Start all services"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

step_counter=1

# Function to print step
print_step() {
  echo ""
  echo -e "${GREEN}[$step_counter/6]${NC} $1"
  echo "-----------------------------------"
  ((step_counter++))
}

# Step 1: Check prerequisites
print_step "Checking prerequisites"
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is required but not installed"
  exit 1
fi
if ! command -v npm &> /dev/null; then
  echo "Error: npm is required but not installed"
  exit 1
fi
if ! command -v docker &> /dev/null; then
  echo "Error: Docker is required but not installed"
  exit 1
fi
echo "✓ All prerequisites found"

# Step 2: Install dependencies
print_step "Installing dependencies"
echo "This may take a few minutes..."
npm install --legacy-peer-deps || {
  echo "Warning: Some dependencies may have peer dependency conflicts"
  echo "This is expected with react-scripts and TypeScript 5.x"
}

# Step 3: Start PostgreSQL
print_step "Starting PostgreSQL"
docker-compose up -d postgres
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Step 4: Generate Prisma client
print_step "Generating Prisma client"
cd backend/shared
npx prisma generate
cd ../..

# Step 5: Run migrations
print_step "Running database migrations"
cd backend/shared
npx prisma migrate deploy || npx prisma migrate dev --name init
cd ../..

# Step 6: Seed database
print_step "Seeding database with sample data"
cd backend/shared
npx ts-node prisma/seeds/index.ts || {
  echo -e "${YELLOW}Warning: Seeding failed. You may need to run 'npm run seed' manually${NC}"
}
cd ../..

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Starting all services..."
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3000"
echo "  API Gateway: http://localhost:4000"
echo ""
echo "Demo credentials:"
echo "  Admin: admin@example.com / Admin123!"
echo "  Analyst: analyst@example.com / Analyst123!"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start all services
npm run dev
