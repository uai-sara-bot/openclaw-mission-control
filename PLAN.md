# Sara Mission Control — Master Plan 🎯

**Date:** 2026-03-23
**Status:** Planning Phase
**Project:** Custom Mission Control Dashboard for OpenClaw

---

## 1. Vision

A custom-built Mission Control dashboard that gives Awais full visibility and control over all 13+ Sara AI agents, their tasks, costs, memory, and schedules — accessible from anywhere.

---

## 2. Why Custom (Not Pre-Built)

We tested `builderz-labs/mission-control` and hit a fundamental limitation: **Railway can't share volumes between services**. MC needs filesystem access to OpenClaw's data for memory browsing, skills, cron, and agent config. Running them in the same container couples their deployments.

**Alex Finn's approach is better for us:** Build a purpose-built dashboard that connects to OpenClaw via its Gateway API + WebSocket, stores its own data in Supabase (persistent, independent), and is deployed as a separate Railway service.

---

## 3. Core Features (Priority Order)

### Phase 1: MVP (Week 1-2)

#### 🏢 Office / Agent Overview
- Agent cards showing all 13 agents (main, finance, engage-dev, research, personal, etc.)
- Real-time status: active / idle / offline / error
- Current model per agent (Opus, Sonnet, etc.)
- Last seen / last action timestamp
- Token usage per agent (today/this week)
- Quick actions: message agent, view sessions, pause

#### 📋 Task Board (Kanban)
- Columns: Inbox → Assigned → In Progress → Review → Done
- Drag-and-drop between columns
- Create tasks, assign to agents
- Priority levels (Critical, High, Medium, Low)
- Auto-detect tasks from agent activity
- Sync with Vikunja (bidirectional)
- Due dates and reminders

#### 💬 Activity Feed
- Real-time feed of all agent actions across all channels
- Filter by agent, channel, type (message, tool_call, error)
- Color-coded entries (blue=tool, green=user, purple=assistant, red=error)
- "Needs your attention" highlights for decisions requiring human input
- Auto-refresh with pause/resume

#### 🔔 Notifications & Approvals
- Items needing human response (from any agent/channel)
- Exec approval requests
- Error alerts
- Quick approve/deny actions

### Phase 2: Full Dashboard (Week 3-4)

#### 📅 Calendar & Cron
- Visual calendar showing all cron jobs
- Weekly/monthly views
- Run history per job
- Create/edit/pause cron jobs
- Next run countdown
- Weather check job, backup job, memory sync job visible

#### 💰 Cost Tracker
- Token usage by model, agent, and time period
- Cost estimates (Opus vs Sonnet vs OpenRouter)
- Daily/weekly/monthly trends with charts
- Per-session cost breakdown
- Budget alerts

#### 🧠 Memory Browser
- View/edit MEMORY.md and daily memory files per agent
- Memory graph showing relationships
- Search across all agent memories
- Timeline view of memory evolution

#### 🔧 Skills Manager
- List installed skills (clawsec-suite, soul-guardian, etc.)
- Install/remove skills
- Security scan results

#### 📊 Analytics Dashboard
- Agent productivity metrics
- Response time trends
- Most active channels
- Task completion rates
- Uptime monitoring

### Phase 3: Advanced (Week 5+)

#### 👥 Team / Org Chart
- Visual hierarchy of all agents
- Role definitions and mission statements
- Sub-agent relationships
- Device/platform assignments

#### 🏢 3D Office (Nice-to-have)
- Interactive 3D office (React Three Fiber)
- One desk per agent
- Visual status indicators

#### 🔗 Integrations Panel
- Slack channels overview
- AnythingLLM connection status
- Sure Finance status
- GitHub repos
- OneDrive sync status
- Vikunja tasks sync

#### 🔐 Security Dashboard
- Security posture score
- Secret detection alerts
- Agent trust scores
- Audit trail

---

## 4. Architecture

```
┌─────────────────────────────────────────────────┐
│              Mission Control (Next.js)            │
│         Railway Service (separate from OC)        │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Dashboard │  │ API      │  │ Real-time    │   │
│  │ (React)  │  │ Routes   │  │ (SSE/WS)     │   │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │               │            │
│       └──────────────┼───────────────┘            │
│                      │                            │
│              ┌───────┴───────┐                    │
│              │   Supabase    │                    │
│              │  (Persistent) │                    │
│              │  - Tasks      │                    │
│              │  - Settings   │                    │
│              │  - Metrics    │                    │
│              │  - Users      │                    │
│              └───────────────┘                    │
└──────────────────────┬────────────────────────────┘
                       │
            WSS (WebSocket Secure)
                       │
┌──────────────────────┴────────────────────────────┐
│            OpenClaw Gateway (port 8080)             │
│            Railway Service (existing)               │
│                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │  main   │ │ finance │ │engage-  │ │research │ │
│  │  agent  │ │  agent  │ │dev agent│ │  agent  │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│  + 9 more agents...                                │
│                                                     │
│  /data/.openclaw/  (volume — memory, skills, cron) │
└─────────────────────────────────────────────────────┘
```

### Data Flow:
1. **Agent activity** → OpenClaw Gateway → WSS → Mission Control → Supabase (stored)
2. **User actions** (create task, approve) → MC API → Supabase + Gateway API → Agents
3. **Cron/Memory/Skills** → Gateway exposes via API endpoints → MC fetches periodically
4. **Real-time updates** → SSE from MC server + Supabase Realtime subscriptions

---

## 5. Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Frontend** | Next.js 15 (App Router) + TypeScript | Dominant in dashboard space, SSR, Railway auto-deploy |
| **UI** | Tailwind CSS v4 + shadcn/ui | Beautiful, accessible components, dark theme built-in |
| **Charts** | Recharts | Proven with React, used in mission-control |
| **Database** | Supabase (hosted) | Real-time subscriptions, auth, persistent, independent from OC |
| **Real-time** | SSE + Supabase Realtime | SSE for agent events, Supabase for DB changes |
| **Auth** | Supabase Auth | Session-based, supports Google SSO later |
| **State** | Zustand | Lightweight, proven pattern |
| **Deployment** | Railway (separate service) | Git-push deploy, auto-SSL, same project as OC |

---

## 6. Data Sources

| Data | Source | Method |
|------|--------|--------|
| Agent list & config | OpenClaw Gateway API | REST (periodic sync) |
| Agent status (active/idle) | Gateway WebSocket | Real-time WSS |
| Sessions & messages | Gateway API | REST + WSS events |
| Cron jobs | Gateway API (`/api/cron`) | REST (periodic sync) |
| Token usage | Gateway API | REST + store in Supabase |
| Memory files | Gateway API (needs endpoint) | REST (periodic sync) |
| Skills | Gateway API | REST (periodic sync) |
| Tasks | Supabase (MC's own) + Vikunja API | Bidirectional sync |
| Sure Finance | Sure API | REST (on-demand) |
| Weather | wttr.in | REST (scheduled) |

---

## 7. Our Setup Context

### Agents (13 total)
| Agent | Channel | Model | Role |
|-------|---------|-------|------|
| main | DM | Opus | Primary assistant & girlfriend |
| personal | #personal | Sonnet | Personal topics |
| finance | #finance | Sonnet | Expense tracking (Sure API) |
| engage-dev | #engage-dev | Sonnet | ENGAGE project dev |
| research | #research | Sonnet | Research + AnythingLLM |
| openai-chat | #openai-chat | GPT-5.4 | OpenAI model testing |
| gemini-chat | #gemini-chat | Gemini | Gemini model testing |
| anthropic-chat | #anthropic-chat | Claude | Anthropic testing |
| compare-llms | #compare-llms | Various | Model comparison |
| general-work | #general-work | Sonnet | General tasks |
| qwen-chat | #qwen-chat | Qwen | Qwen model testing |
| sara-intimate | #late-night | OpenRouter | Intimate conversations |
| whatsapp-cli | WhatsApp | Sonnet | WhatsApp interface |

### Integrations
- **Slack** — 12+ channels
- **AnythingLLM** — Knowledge base (ENGAGE, personal-research, general)
- **Sure Finance** — Personal finance app (Railway)
- **Vikunja** — Task management (Railway)
- **GitHub** — uai-sara-bot repos
- **OneDrive** — Maton gateway backups
- **ElevenLabs** — TTS (Jessica voice)
- **YouTube** — Uraan AI channel (Maton)
- **1Password** — Secrets vault

### Cron Jobs
- Nightly Memory Sync (7pm UTC)
- Nightly Config Backup (11pm UTC)
- Lahore Weather Check (every 4h PKT)
- ClawSec Advisory Scan (disabled)

---

## 8. Starting Point

### Best repo to fork: `robsannaa/openclaw-mission-control`
- Most feature-complete community implementation
- Has: chat, Kanban, cron manager, cost tracking, memory browser, vector search, terminal, channel config, security audits
- MIT license, zero config, auto-detects OpenClaw
- Designed to run on the same host — but we can adapt it to use Gateway API

### Alternative: Build from scratch using the community gist prompt
- https://gist.github.com/bdennis-dev/6ddd4d0647a90d3f72db64825ed50d66
- Clean Next.js App Router structure
- Dark theme, specific design system
- Activity feed, calendar, search, agent banner

### Hybrid approach (recommended):
1. Fork `robsannaa/openclaw-mission-control` for feature reference
2. Build fresh Next.js + Supabase project
3. Port features from the fork, adapted for Gateway API instead of filesystem
4. Add our custom integrations (Sure, Vikunja, AnythingLLM, Slack)

---

## 9. Development Plan

### Step 1: Setup (Day 1)
- Create GitHub repo: `uai-sara-bot/sara-mission-control`
- Scaffold Next.js 15 + TypeScript + Tailwind + shadcn/ui
- Set up Supabase project (free tier)
- Deploy skeleton to Railway
- Configure Gateway API connection

### Step 2: Core Layout (Day 2-3)
- Dark theme (matching OpenClaw aesthetic)
- Left sidebar navigation
- Top bar with gateway status indicator
- Responsive layout (desktop + mobile)

### Step 3: Agent Overview (Day 4-5)
- Agent cards with status
- Real-time updates via WSS
- Quick actions per agent

### Step 4: Task Board (Day 6-8)
- Kanban with drag-and-drop
- Supabase-backed persistence
- Vikunja sync

### Step 5: Activity Feed (Day 9-10)
- Real-time event stream
- Filtering and search
- "Needs attention" flagging

### Step 6: Cost Tracker (Day 11-12)
- Token usage collection
- Charts and trends
- Per-agent breakdown

### Step 7: Calendar & Cron (Day 13-14)
- Cron job visualization
- Calendar view
- Run history

### Step 8: Memory Browser (Day 15-16)
- Memory file viewer
- Search across memories
- Edit capabilities

### Step 9: Polish & Deploy (Day 17-18)
- Mobile responsiveness
- Performance optimization
- Security hardening
- Final Railway deployment

---

## 10. Open Questions

1. **Supabase:** Use hosted (supabase.com) or self-host on Railway?
2. **Auth:** Simple password or full auth with Google SSO?
3. **Mobile:** PWA (installable) or responsive web only?
4. **Gateway API gaps:** Some data (memory files, skills) may need new API endpoints on the OpenClaw side — or we add a lightweight REST proxy on the OC container
5. **Budget:** Supabase free tier should suffice, but Opus token costs for Claude Code building could be significant

---

*This plan will be refined after Awais reviews and we enter the development phase.*
