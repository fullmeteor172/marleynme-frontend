# Quick Start Guide

## 🖥️ Running Locally

```bash
# Stop any running containers
docker compose down

# Start local development (no SSL, port 3000)
docker compose -f docker-compose.local.yaml up -d --build

# View logs
docker compose logs -f

# Access your app
open http://localhost:3000
```

## 🚀 Deploying to Production (Hetzner VPS)

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Clone repo (first time only)
git clone https://github.com/fullmeteor172/marleynme-frontend.git
cd marleynme-frontend

# Setup environment (first time only)
cp .env.production .env

# Deploy
docker compose up -d --build

# Check status
docker compose ps
docker compose logs -f
```

## 🔄 Updating

### Local
```bash
git pull
docker compose -f docker-compose.local.yaml up -d --build
```

### Production
```bash
ssh root@YOUR_VPS_IP
cd marleynme-frontend
git pull
docker compose up -d --build
```

## 🐛 Common Issues

### SSL Error on localhost?
Use `docker-compose.local.yaml` instead of `docker-compose.yaml`

### Port already in use?
```bash
docker compose down
```

### Need to rebuild?
```bash
docker compose down
docker compose up -d --build
```

---

For full deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md)
