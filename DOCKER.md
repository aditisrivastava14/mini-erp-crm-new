# GigFlow CRM - Docker Setup Guide

## Overview

GigFlow CRM uses Docker and Docker Compose for containerized development and production deployments. This guide covers setup, configuration, and best practices.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- No need to install Node.js, MongoDB, or other dependencies locally

## Development Setup

### 1. Start Development Environment

```bash
# Start all services (backend, frontend, MongoDB)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 2. Access Services

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **MongoDB**: localhost:27017 (no auth required in dev)

### 3. Development Commands

```bash
# Rebuild services
docker-compose build

# Stop services
docker-compose down

# Remove volumes (clean database)
docker-compose down -v

# View running containers
docker-compose ps

# Execute command in a container
docker-compose exec backend npm run seed
docker-compose exec frontend npm run lint
```

### 4. Environment Variables (Development)

Copy `.env.development.example` to `.env.development`:
```bash
cp .env.development.example .env.development
```

The dev setup uses default secure values suitable for development.

## Production Setup

### 1. Prepare Environment

Copy and configure production environment:
```bash
cp .env.production.example .env.production
```

**Required changes in `.env.production`**:
- Set `JWT_SECRET` to a strong random string (32+ characters)
- Set `MONGO_ROOT_PASSWORD` to a strong password
- Set `CLIENT_URL` to your actual domain
- Set `VITE_API_URL` to your API domain

### 2. Build Production Images

```bash
# Build with production compose file
docker-compose -f docker-compose.prod.yml build

# Optional: Tag for registry
docker tag gigflow-backend:latest your-registry.com/gigflow-backend:v1.0.0
docker tag gigflow-frontend:latest your-registry.com/gigflow-frontend:v1.0.0
```

### 3. Deploy Production

```bash
# Start with production compose file
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### 4. Production Considerations

- **Environment Variables**: Use `.env.production` with actual secrets
- **HTTPS**: Set up a reverse proxy (nginx, traefik) in front of the containers
- **Backups**: Regular MongoDB backups using:
  ```bash
  docker-compose -f docker-compose.prod.yml exec mongodb mongodump --archive=/data/db/backup-$(date +%Y%m%d).archive
  ```
- **Health Checks**: All services include health checks; monitor container status
- **Security**: Keep MongoDB inside the Docker network, never expose directly

## Architecture

### Services

**Backend** (Node.js + Express + Mongoose + Socket.io)
- Dockerfile: Multi-stage build for optimal size
- Runtime: 20-alpine (lightweight)
- Port: 5000
- Health Check: HTTP GET /api/v1/health

**Frontend** (React + Vite + Nginx)
- Dockerfile: Multi-stage build with Nginx serving
- Runtime: Nginx Alpine
- Port: 80 (dev: 5173)
- Features:
  - API proxy to backend (`/api/` → backend:5000)
  - Socket.IO proxy (`/socket.io` → backend:5000)
  - SPA routing (fallback to index.html)
  - Gzip compression
  - Static asset caching

**MongoDB**
- Image: mongo:7-alpine
- Port: 27017
- Persistence: Docker volume `mongodb_data`
- Health Check: MongoDB ping

### Networks

- **Development**: `gigflow-dev` bridge network (isolated)
- **Production**: `gigflow` bridge network (isolated)

All services communicate within the network; only exposed ports are accessible from host.

## Build Optimization

### Multi-stage Builds

Both Dockerfiles use multi-stage builds:
1. **Builder stage**: Install dependencies, build source
2. **Runtime stage**: Copy only compiled artifacts, minimal dependencies
3. **Result**: Smaller images (~500MB backend, ~50MB frontend)

### Layer Caching

- Copy package files first (frequently cached)
- Install dependencies before source code
- Source code changes don't invalidate dependency layer

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Verify health check
docker-compose ps
```

### Port conflicts

If ports 5000, 5173, 27017, or 80 are in use:
- Modify `docker-compose.yml` ports mapping
- Or kill existing processes: `lsof -i :5000`

### MongoDB connection issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Connect to MongoDB manually
docker-compose exec mongodb mongosh

# Verify network
docker network inspect gigflow-dev
```

### Frontend can't reach backend

- Check API URL in frontend environment: `VITE_API_URL`
- Verify backend is running: `docker-compose ps backend`
- Check Nginx config is properly copied: `docker-compose exec frontend cat /etc/nginx/conf.d/default.conf`

### Theme not persisting in dark mode

- Clear browser local storage and refresh
- Check IndexedDB quota (DevTools → Application tab)

## Performance Tips

1. **Use `.dockerignore`**: Excludes unnecessary files from build context
2. **Enable BuildKit**: `DOCKER_BUILDKIT=1 docker build` for faster builds
3. **Parallel builds**: `docker-compose build --parallel`
4. **Volume mounts**: Use volumes for hot-reload in development
5. **Resource limits**: Set CPU/memory limits in production for orchestrators

## Security Best Practices

1. **Never commit secrets**: Use `.env` files, not inline in docker-compose
2. **Use read-only volumes** in production where possible
3. **Keep images updated**: Regularly rebuild with latest base images
4. **Scan images**: Use `docker scan` or Trivy for vulnerabilities
5. **Network isolation**: Services only communicate through Docker network
6. **HTTPS in production**: Always use TLS/SSL with reverse proxy

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Images
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/login-action@v2
        with:
          registry: ${{ secrets.REGISTRY }}
          username: ${{ secrets.REGISTRY_USER }}
          password: ${{ secrets.REGISTRY_PASSWORD }}
      - uses: docker/build-push-action@v4
        with:
          context: .
          dockerfile: apps/backend/Dockerfile
          push: true
          tags: ${{ secrets.REGISTRY }}/gigflow-backend:latest
```

## Kubernetes Deployment

For production Kubernetes deployments:

1. Create ConfigMaps for non-secret environment variables
2. Create Secrets for sensitive data (JWT_SECRET, passwords)
3. Use StatefulSet for MongoDB with PersistentVolumeClaim
4. Use Deployment for backend and frontend
5. Configure Ingress for routing and TLS termination

See `k8s/` directory for example manifests.

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker](https://hub.docker.com/_/mongo)
- [Nginx Docker](https://hub.docker.com/_/nginx)
