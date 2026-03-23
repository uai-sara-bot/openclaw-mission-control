# Configuration Reference

All configuration is done via environment variables. Copy `.env.example` to `.env.local` for local development.

## Required Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_ANON_KEY` | Supabase publishable/anon key (safe for client-side) |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server-side only, never expose) |
| `OPENCLAW_GATEWAY_URL` | WebSocket URL to OpenClaw gateway (e.g. `wss://gateway.example.com`) |
| `OPENCLAW_GATEWAY_TOKEN` | Authentication token for the gateway |

## Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the Next.js server listens on |
| `OPENCLAW_HOME` | — | Path to `.openclaw` home directory for memory browser and logs |
| `OPENCLAW_GATEWAY_HOST` | `127.0.0.1` | Gateway host (if connecting directly instead of via URL) |
| `OPENCLAW_GATEWAY_PORT` | `18789` | Gateway port |

## Environment Files

| File | Purpose | Committed |
|------|---------|-----------|
| `.env.example` | Template with all variables documented | Yes |
| `.env.local` | Local development overrides | No |
| `.env` | Docker / production | No |

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** to find your keys
3. The **anon key** is safe for client-side use
4. The **service_role key** must be kept secret (server-side only)

## OpenClaw Gateway

The dashboard connects to OpenClaw via WebSocket for real-time agent events and via REST API for commands.

- **WSS URL**: The full WebSocket URL (e.g. `wss://gateway.example.com`)
- **Token**: The gateway auth token configured in your OpenClaw setup

## Docker-Specific

When using Docker Compose, variables are loaded from `.env` in the project root. The compose file also supports:

| Variable | Default | Description |
|----------|---------|-------------|
| `MC_PORT` | `3000` | Host port mapping |
