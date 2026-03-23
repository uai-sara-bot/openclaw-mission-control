# CLAUDE.md — OpenClaw Mission Control

## Project Overview
A custom Mission Control dashboard for OpenClaw AI agent orchestration. Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Database:** Supabase (Postgres + Realtime)
- **Charts:** Recharts
- **State:** Zustand
- **Auth:** Simple password auth (stored in Supabase)
- **Deployment:** Railway

## Environment Variables (set in Railway / .env.local)
```
SUPABASE_URL=         # Supabase project URL
SUPABASE_ANON_KEY=    # Supabase publishable/anon key
SUPABASE_SERVICE_KEY= # Supabase secret/service key
OPENCLAW_GATEWAY_URL= # WSS URL to OpenClaw gateway
OPENCLAW_GATEWAY_TOKEN= # Gateway auth token
```

## Design System
- **Theme:** Dark (#0A0A0F background, #1A1A2E cards, #141428 sidebar)
- **Accent colors:** Blue (#3B82F6), Green (#10B981), Purple (#8B5CF6), Red (#EF4444), Orange (#F59E0B)
- **Font:** Inter (sans-serif), JetBrains Mono (monospace)
- **Layout:** Left sidebar navigation + main content area + optional right panel

## OpenClaw Gateway API
The dashboard connects to OpenClaw via WebSocket (WSS) and REST API.
Auth via Bearer token or gateway token header.

## Agents (13 total)
main (Opus), personal (Sonnet), finance (Sonnet), engage-dev (Sonnet), research (Sonnet), openai-chat (GPT-5.4), gemini-chat (Gemini), anthropic-chat (Claude), compare-llms (Various), general-work (Sonnet), qwen-chat (Qwen), sara-intimate (OpenRouter), whatsapp-cli (Sonnet)

## Features to Build (Priority Order)
1. Agent Overview — cards with real-time status, model, last activity
2. Task Board — Kanban with drag-and-drop (Inbox → Assigned → In Progress → Review → Done)
3. Activity Feed — real-time stream from all agents, filterable
4. Cost Tracker — token usage by model/agent with charts
5. Calendar/Cron — cron job visualization
6. Memory Browser — view/edit agent memory files
7. Notifications — items needing human attention

## Commands
```bash
pnpm install        # Install dependencies
pnpm dev           # Dev server (localhost:3000)
pnpm build         # Production build
pnpm lint          # ESLint
pnpm typecheck     # TypeScript check
```

## Key Files
- `PLAN.md` — Full project plan with architecture
- `docs/research-alex-finn.md` — Feature research from Alex Finn's videos
- `docs/research-existing-tools.md` — Existing tools analysis
