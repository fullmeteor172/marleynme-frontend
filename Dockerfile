# -----------------------------------------------
# 1. Build stage
# -----------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
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
