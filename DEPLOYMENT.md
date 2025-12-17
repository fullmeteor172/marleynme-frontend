# Deployment Guide - MarleyNMe Frontend

## 🚨 IMPORTANT: Local vs Production

### Running Locally (Development)

Use `docker-compose.local.yaml` to run on your machine:

```bash
# Stop any running containers first
docker compose down

# Run locally (accessible at http://localhost:3000)
docker compose -f docker-compose.local.yaml up -d --build
```

**Why?** The production `docker-compose.yaml` uses SSL certificates for `marleynme.in` which won't work on localhost.

### Running on Production (Hetzner VPS)

Use the regular `docker-compose.yaml` on your server:

```bash
# On your VPS
docker compose up -d --build
```

**Why?** This configuration gets SSL certificates for your domain and runs on ports 80/443.

---

## Quick Deployment to Hetzner VPS

This guide will help you deploy your frontend to a Hetzner VPS with Cloudflare DNS.

### Prerequisites

- A Hetzner VPS with Docker and Docker Compose installed
- Domain `marleynme.in` configured in Cloudflare
- Backend API running at `api.marleynme.in`

---

## Step 1: Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

---

## Step 2: Install Docker (if not already installed)

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

---

## Step 3: Clone Your Repository

```bash
# Install git if needed
apt install git -y

# Clone the repository
git clone https://github.com/fullmeteor172/marleynme-frontend.git
cd marleynme-frontend
```

---

## Step 4: Configure Environment Variables

```bash
# Copy the production environment template
cp .env.production .env

# The .env file should already have the correct values:
# VITE_API_BASE_URL=https://api.marleynme.in
# VITE_SUPABASE_URL=https://abstdkenvovmowurobjv.supabase.co
# VITE_SUPABASE_ANON_KEY=your_key_here
```

---

## Step 5: Build and Run with Docker

```bash
# Build and start the container
docker-compose up -d --build

# Check if it's running
docker-compose ps

# View logs if needed
docker-compose logs -f
```

---

## Step 6: Configure Cloudflare

### DNS Settings

1. Go to Cloudflare Dashboard
2. Select your domain `marleynme.in`
3. Go to **DNS** section
4. Add/Update these records:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | @ | YOUR_VPS_IP | Proxied (Orange) |
| A | www | YOUR_VPS_IP | Proxied (Orange) |
| A | api | YOUR_VPS_IP | Proxied (Orange) |

### SSL/TLS Settings

1. Go to **SSL/TLS** section
2. Set SSL/TLS encryption mode to **Full** or **Full (strict)**
3. Enable **Always Use HTTPS**

### Additional Recommended Settings

1. **Speed** → **Optimization**
   - Enable Auto Minify (HTML, CSS, JS)
   - Enable Brotli compression

2. **Caching** → **Configuration**
   - Set Browser Cache TTL to "Respect Existing Headers"

---

## Step 7: Verify Deployment

1. Wait 2-3 minutes for Cloudflare to update
2. Visit `https://marleynme.in` in your browser
3. Verify the site loads correctly
4. Check that API calls work properly

---

## Useful Commands

```bash
# Stop the containers
docker-compose down

# Restart the containers
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild after code changes
git pull
docker-compose up -d --build

# Remove old images to free space
docker image prune -a
```

---

## Updating the Deployment

When you make changes to the code:

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Navigate to the project
cd marleynme-frontend

# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

---

## Troubleshooting

### SSL Error on Localhost (SSL_ERROR_INTERNAL_ERROR_ALERT)

**Problem**: Getting SSL errors when accessing http://127.0.0.1 or http://localhost

**Solution**: You're using the production docker-compose.yaml locally! Use the local version instead:

```bash
# Stop the production container
docker compose down

# Use the local configuration
docker compose -f docker-compose.local.yaml up -d --build

# Access at http://localhost:3000
```

### Container won't start
```bash
docker compose logs
```

### Port 80/443 already in use
```bash
# Check what's using the port
lsof -i :80
lsof -i :443

# Stop conflicting services (e.g., Apache)
systemctl stop apache2
systemctl disable apache2
```

### Can't access the site
1. Check if container is running: `docker-compose ps`
2. Check Cloudflare DNS settings
3. Verify firewall allows ports 80/443:
```bash
ufw allow 80
ufw allow 443
```

### SSL certificate issues
- Caddy will automatically obtain SSL certificates
- First request might take a few seconds
- Check logs: `docker-compose logs`

---

## Security Recommendations

1. **Setup a firewall**:
```bash
ufw enable
ufw allow ssh
ufw allow 80
ufw allow 443
```

2. **Regular updates**:
```bash
apt update && apt upgrade -y
```

3. **Monitor logs**:
```bash
docker-compose logs -f
```

---

## That's It!

Your frontend should now be live at `https://marleynme.in` 🎉

The setup includes:
- ✅ Automatic HTTPS via Caddy
- ✅ Auto-restart on server reboot
- ✅ Cloudflare CDN and protection
- ✅ Production-optimized build
