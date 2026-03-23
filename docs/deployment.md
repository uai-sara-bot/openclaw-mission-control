# Deployment Guide

## Railway (Recommended)

Railway auto-detects Next.js and deploys with zero configuration.

### Steps

1. Push your code to GitHub
2. Connect the repo at [railway.app](https://railway.app)
3. Add environment variables in the Railway dashboard (see [Configuration](configuration.md))
4. Railway builds and deploys automatically on push

### Environment Variables

Set these in Railway's dashboard under your service settings:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `OPENCLAW_GATEWAY_URL`
- `OPENCLAW_GATEWAY_TOKEN`

Railway sets `PORT` automatically.

## Docker

### Using Docker Compose

```bash
# Copy and configure env
cp .env.example .env
# Edit .env with your credentials

# Build and start
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

The container runs as a non-root user with a read-only filesystem and limited capabilities.

### Manual Docker Build

```bash
docker build -t openclaw-mc .
docker run -d \
  --name openclaw-mc \
  -p 3000:3000 \
  --env-file .env \
  openclaw-mc
```

### Health Check

The container includes a health check on the root path. Check status:

```bash
docker inspect --format='{{.State.Health.Status}}' openclaw-mission-control
```

### Resource Limits

Default compose limits:
- **Memory:** 512MB
- **CPU:** 1 core

Adjust in `docker-compose.yml` under `deploy.resources.limits`.

## Manual / VPS

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Start production server
PORT=3000 pnpm start
```

Use a process manager like `pm2` or `systemd` to keep the server running:

```bash
# With pm2
pm2 start pnpm --name "openclaw-mc" -- start
```

## Reverse Proxy (Nginx)

If running behind Nginx:

```nginx
server {
    listen 443 ssl;
    server_name mc.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

The `Upgrade` and `Connection` headers are required for WebSocket connections to the OpenClaw gateway.
