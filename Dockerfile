# -----------------------------------------------
# 1. Build stage
# -----------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Build the application
RUN npm run build


# -----------------------------------------------
# 2. Production web server (Caddy)
# -----------------------------------------------
FROM caddy:2-alpine

# Copy build output into Caddy's public directory
COPY --from=builder /app/dist /usr/share/caddy

# Provide custom Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
EXPOSE 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
