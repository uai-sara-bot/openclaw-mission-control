# OpenClaw Mission Control

A custom operations dashboard for [OpenClaw](https://github.com/openclaw) AI agent orchestration. Monitor, manage, and coordinate your fleet of 13+ AI agents from a single dark-themed control panel.

Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase, and Recharts.

<!-- TODO: Add screenshot -->
![Dashboard Screenshot](docs/assets/screenshot-placeholder.png)

## Features

- **Agent Overview** — Real-time status cards for all 13 agents (Opus, Sonnet, GPT-5.4, Gemini, etc.)
- **Task Board** — Kanban drag-and-drop (Inbox → Assigned → In Progress → Review → Done)
- **Activity Feed** — Live-streaming events from all agents, filterable by agent/type
- **Cost Tracker** — Token usage and spend by model/agent with interactive charts
- **Calendar/Cron** — Cron job visualization and scheduling
- **Memory Browser** — View and edit agent memory files
- **Notifications** — Items requiring human attention

## Quick Start

### Prerequisites

- **Node.js 22+** (see `.nvmrc`)
- **pnpm** (enabled via corepack)
- A **Supabase** project (free tier works)

### Local Development

```bash
# Clone and install
git clone https://github.com/openclaw/mission-control.git
cd mission-control
corepack enable && corepack prepare pnpm@latest --activate
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials and gateway URL

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### One-Command Setup

```bash
bash install.sh
```

This detects your environment, installs dependencies, generates `.env.local`, and starts the dev server.

### Docker

```bash
# Build and run
docker compose up -d

# Or build manually
docker build -t openclaw-mc .
docker run -p 3000:3000 --env-file .env openclaw-mc
```

### Railway

1. Connect this repo to [Railway](https://railway.app)
2. Set the environment variables listed in `.env.example`
3. Railway auto-detects Next.js and deploys

## Environment Variables

See [`.env.example`](.env.example) for all variables with documentation. Key ones:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase publishable/anon key |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase secret/service key |
| `OPENCLAW_GATEWAY_URL` | Yes | WSS URL to OpenClaw gateway |
| `OPENCLAW_GATEWAY_TOKEN` | Yes | Gateway auth token |
| `PORT` | No | Server port (default: 3000) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (Postgres + Realtime) |
| Charts | Recharts |
| State | Zustand |
| Deployment | Railway / Docker |

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/    # React components
  lib/           # Utilities, Supabase client, stores
  types/         # TypeScript type definitions
docs/            # Documentation
scripts/         # Build and setup scripts
```

## Scripts

```bash
pnpm dev         # Dev server (localhost:3000)
pnpm build       # Production build
pnpm start       # Start production server
pnpm lint        # ESLint
```

## Documentation

- [Quick Start Guide](docs/quickstart.md)
- [Deployment Guide](docs/deployment.md)
- [Configuration Reference](docs/configuration.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
