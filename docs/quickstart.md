# Quick Start Guide

## Prerequisites

- **Node.js 22+** — install via [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm)
- **pnpm** — enabled via `corepack enable`
- **Supabase account** — [supabase.com](https://supabase.com) (free tier works)
- **OpenClaw gateway** — running and accessible

## 1. Clone the Repository

```bash
git clone https://github.com/openclaw/mission-control.git
cd mission-control
```

## 2. Install Dependencies

```bash
corepack enable && corepack prepare pnpm@latest --activate
pnpm install
```

Or use the setup script:

```bash
bash scripts/setup.sh
```

## 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
OPENCLAW_GATEWAY_URL=wss://your-gateway-url
OPENCLAW_GATEWAY_TOKEN=your-token
```

### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a project
2. Navigate to Settings → API
3. Copy the **Project URL**, **anon/public key**, and **service_role key**

### Getting Gateway Credentials

Your OpenClaw gateway URL and token are configured when you set up the OpenClaw gateway service.

## 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 5. Verify Connection

The Agent Overview page should show your 13 agents. If agents appear offline, verify your gateway URL and token in `.env.local`.

## Alternative: One-Command Install

```bash
bash install.sh
```

This auto-detects Docker or Node.js and handles everything. Use `--docker` or `--local` to force a mode.

## Next Steps

- [Deployment Guide](deployment.md) — deploy to Railway or Docker
- [Configuration Reference](configuration.md) — all environment variables
