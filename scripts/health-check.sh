#!/bin/bash

echo "=================================="
echo "Financial Analytics Dashboard"
echo "Health Check Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Services to check
declare -A SERVICES
SERVICES[api-gateway]="http://localhost:4000/health"
SERVICES[auth-service]="http://localhost:4001/health"
SERVICES[analytics-service]="http://localhost:4002/health"
SERVICES[data-service]="http://localhost:4003/health"
SERVICES[reporting-service]="http://localhost:4004/health"
SERVICES[frontend]="http://localhost:3000"

# Check if curl is available
if ! command -v curl &> /dev/null; then
  echo -e "${RED}✗${NC} curl is required but not installed"
  exit 1
fi

echo "Checking services..."
echo ""

ALL_HEALTHY=true

for service in "${!SERVICES[@]}"; do
  url="${SERVICES[$service]}"

  # Try to connect
  if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $service is running ($url)"
  else
    echo -e "${RED}✗${NC} $service is not responding ($url)"
    ALL_HEALTHY=false
  fi
done

echo ""

if [ "$ALL_HEALTHY" = true ]; then
  echo -e "${GREEN}All services are healthy!${NC}"
  echo ""
  echo "Access the dashboard at: http://localhost:3000"
  echo "API Gateway at: http://localhost:4000"
  exit 0
else
  echo -e "${YELLOW}Some services are not responding.${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Make sure all services are started: npm run dev"
  echo "  2. Check logs for errors"
  echo "  3. Verify PostgreSQL is running: docker-compose ps postgres"
  echo "  4. Check ports are not in use: lsof -i :4000-4004,3000"
  exit 1
fi
