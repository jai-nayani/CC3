# 🚀 Deployment Guide

Complete guide for deploying the Financial Analytics Dashboard to production.

---

## 📋 Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [AWS Deployment](#aws-deployment)
- [Database Migration](#database-migration)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Security Hardening](#security-hardening)

---

## ✅ Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All services build successfully
- [ ] Tests pass locally
- [ ] Environment variables configured
- [ ] Database backup strategy in place
- [ ] SSL certificates obtained
- [ ] Domain names configured
- [ ] Monitoring tools set up
- [ ] Security audit completed

---

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production`:

```bash
# Database
DATABASE_URL="postgresql://user:password@your-db-host:5432/healthcare_analytics"

# JWT (CRITICAL: Change these!)
JWT_SECRET=<generate-strong-random-32-char-secret>
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Service Ports
API_GATEWAY_PORT=4000
AUTH_SERVICE_PORT=4001
ANALYTICS_SERVICE_PORT=4002
DATA_SERVICE_PORT=4003
REPORTING_SERVICE_PORT=4004

# Application
NODE_ENV=production
LOG_LEVEL=error

# CORS
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# AWS (if using)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=healthcare-analytics-exports

# Redis (production cache)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### Generate Secrets

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Session Secret
openssl rand -base64 32
```

---

## 🐳 Docker Deployment

### Build Production Images

```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Or build individually
docker build -f docker/Dockerfile.api-gateway -t analytics-gateway:latest .
docker build -f docker/Dockerfile.auth -t analytics-auth:latest .
docker build -f docker/Dockerfile.analytics -t analytics-analytics:latest .
docker build -f docker/Dockerfile.data -t analytics-data:latest .
docker build -f docker/Dockerfile.reporting -t analytics-reporting:latest .
docker build -f docker/Dockerfile.frontend -t analytics-frontend:latest .
```

### Deploy with Docker Compose

```bash
# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Production docker-compose.prod.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: healthcare_analytics
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - backend

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    networks:
      - backend

  api-gateway:
    image: analytics-gateway:latest
    restart: always
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    networks:
      - backend
      - frontend

  auth-service:
    image: analytics-auth:latest
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    networks:
      - backend

  analytics-service:
    image: analytics-analytics:latest
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    depends_on:
      - postgres
      - redis
    networks:
      - backend

  data-service:
    image: analytics-data:latest
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      - postgres
    networks:
      - backend

  reporting-service:
    image: analytics-reporting:latest
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      - postgres
    networks:
      - backend

  frontend:
    image: analytics-frontend:latest
    restart: always
    ports:
      - "80:3000"
    networks:
      - frontend

volumes:
  pgdata:

networks:
  backend:
  frontend:
```

---

## ☁️ AWS Deployment

### Architecture

```
┌─────────────────────────────────────────┐
│           CloudFront (CDN)              │
│         + SSL Certificate               │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   Application Load Balancer (ALB)      │
│   + Target Groups                       │
└────┬────────────────────────┬───────────┘
     │                        │
┌────▼────────┐        ┌──────▼──────────┐
│   ECS       │        │   ECS           │
│  (Frontend) │        │  (Backend)      │
│   Fargate   │        │   Fargate       │
└─────────────┘        └────────┬────────┘
                                │
                       ┌────────▼────────┐
                       │   RDS           │
                       │  PostgreSQL     │
                       │  (Multi-AZ)     │
                       └─────────────────┘
```

### 1. Setup RDS PostgreSQL

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier healthcare-analytics-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.3 \
  --master-username postgres \
  --master-user-password <strong-password> \
  --allocated-storage 100 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name healthcare-analytics-subnet \
  --backup-retention-period 7 \
  --multi-az
```

### 2. Create ECR Repositories

```bash
# Create repositories for each service
aws ecr create-repository --repository-name analytics/gateway
aws ecr create-repository --repository-name analytics/auth
aws ecr create-repository --repository-name analytics/analytics
aws ecr create-repository --repository-name analytics/data
aws ecr create-repository --repository-name analytics/reporting
aws ecr create-repository --repository-name analytics/frontend
```

### 3. Push Images to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag analytics-gateway:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/analytics/gateway:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/analytics/gateway:latest

# Repeat for all services
```

### 4. Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name healthcare-analytics-cluster
```

### 5. Create Task Definitions

Example for API Gateway:

```json
{
  "family": "analytics-gateway",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "gateway",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/analytics/gateway:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:xxxxx:secret:db-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:xxxxx:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/analytics-gateway",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 6. Create ECS Services

```bash
aws ecs create-service \
  --cluster healthcare-analytics-cluster \
  --service-name gateway-service \
  --task-definition analytics-gateway:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:xxxxx:targetgroup/analytics-gateway/xxxxx,containerName=gateway,containerPort=4000
```

---

## 🗄️ Database Migration

### Run Migrations in Production

```bash
# Using Docker
docker exec -it <postgres-container> psql -U postgres -d healthcare_analytics

# Run Prisma migrations
cd backend/shared
DATABASE_URL="production-url" npx prisma migrate deploy

# Verify
DATABASE_URL="production-url" npx prisma migrate status
```

### Backup Before Migration

```bash
# Backup database
pg_dump -h <host> -U postgres -d healthcare_analytics > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore if needed
psql -h <host> -U postgres -d healthcare_analytics < backup_20241117_120000.sql
```

---

## 📊 Monitoring & Logging

### CloudWatch Setup

```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/analytics-gateway
aws logs create-log-group --log-group-name /ecs/analytics-auth
aws logs create-log-group --log-group-name /ecs/analytics-analytics
aws logs create-log-group --log-group-name /ecs/analytics-data
aws logs create-log-group --log-group-name /ecs/analytics-reporting
```

### Metrics to Monitor

- **API Gateway**: Request rate, latency, error rate
- **Services**: CPU, memory, response time
- **Database**: Connections, query time, locks
- **Redis**: Hit rate, memory usage

### Alerting

Create CloudWatch alarms for:
- High error rate (> 5%)
- Slow response time (> 2s)
- Database connections (> 80%)
- Memory usage (> 90%)

---

## 💾 Backup & Recovery

### Automated Backups

RDS automated backups (enabled by default):
- Daily snapshots
- 7-day retention
- Point-in-time recovery

### Manual Backup

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier healthcare-analytics-db \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

### Export Data

```bash
# Export to S3
aws s3 cp backup.sql s3://healthcare-analytics-backups/$(date +%Y%m%d)/
```

---

## 🔒 Security Hardening

### SSL/TLS

```bash
# Using Let's Encrypt with Certbot
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

### Security Headers

Already configured in Helmet.js:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security

### Database Security

- ✅ Use SSL connections
- ✅ Restrict IP access (security groups)
- ✅ Rotate credentials regularly
- ✅ Enable encryption at rest
- ✅ Use parameter groups with secure settings

### Secrets Management

Use AWS Secrets Manager:

```bash
# Store secret
aws secretsmanager create-secret \
  --name healthcare-analytics/jwt-secret \
  --secret-string "your-secret-here"

# Retrieve in application
const secret = await secretsManager.getSecretValue({SecretId: 'healthcare-analytics/jwt-secret'}).promise();
```

---

## 🔄 CI/CD Pipeline

GitHub Actions already configured (`.github/workflows/ci.yml`).

To enable:
```bash
mv .github/workflows/ci.yml.disabled .github/workflows/ci.yml
```

Configure GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DATABASE_URL`
- `JWT_SECRET`

---

## 📞 Support

For deployment issues:
- Check CloudWatch logs
- Review ECS service events
- Verify environment variables
- Test database connectivity

---

<div align="center">

**Production deployment complete!** 🎉

[← Back to Setup](SETUP.md) | [Monitoring Guide →](#monitoring--logging)

</div>
