# Mission Control Dashboard — Research: Existing Tools & Tech Stack

**Date:** 2026-03-23  
**Purpose:** Evaluate existing open-source dashboards and determine the best tech stack for building a custom OpenClaw mission control dashboard.

---

## 1. Existing OpenClaw Dashboard Projects

### 1.1 Official OpenClaw Dashboard (Built-in)
- **URL:** https://github.com/openclaw/openclaw (part of core repo)
- **Access:** `http://localhost:18789` or `openclaw dashboard`
- **Features:** Manage channels, agents, configuration, logs; onboarding wizard for API keys
- **Limitations:** Basic management UI, not designed as a "mission control" for monitoring multiple agents in real-time
- **Adaptability:** ⭐⭐ — Good base but limited monitoring/analytics capabilities

### 1.2 OpenClaw Studio
- **URL:** https://github.com/grp06/openclaw-studio
- **Stars:** ~451 | **Forks:** 63 | **Contributors:** 4
- **Tech Stack:** TypeScript (97%), JavaScript, CSS
- **License:** MIT
- **Features:**
  - Clean web UI for OpenClaw
  - Connect to Gateway, view agents, chat
  - Manage approvals and configure settings
  - Workflow tools
- **Status:** No releases yet, actively maintained
- **Adaptability:** ⭐⭐⭐⭐ — Most promising OpenClaw-specific project. Could be forked and extended with monitoring panels, real-time updates, and task management.

### 1.3 mudrii/openclaw-dashboard
- **URL:** https://github.com/mudrii/openclaw-dashboard
- **Stars:** ~56 | **Releases:** 8 (latest v2.6.0, Feb 2026)
- **Tech Stack:** HTML (57%), Shell (37%), Python (6%)
- **License:** MIT
- **Features:**
  - Zero-dependency command center
  - Token usage & cost tracking
  - Agent hierarchy tree & model routing
- **Adaptability:** ⭐⭐ — Lightweight but limited tech stack (static HTML). Good for reference on metrics/tracking features.

### 1.4 openclaw-mission-control
- **URL:** https://github.com/abhi1693/openclaw-mission-control
- **Features:** Task assignment, multi-agent collaboration via OpenClaw Gateway
- **Adaptability:** ⭐⭐⭐ — Directly relevant, designed for agent orchestration via Gateway.

### 1.5 carlosazaustre/tenacitOS
- **URL:** https://github.com/carlosazaustre/tenacitOS
- **Tech Stack:** TypeScript (98%)
- **Features:** Mission control dashboard; designed to clone into OpenClaw workspace
- **Adaptability:** ⭐⭐⭐ — Workspace-integrated approach is interesting.

### 1.6 madrzak/vidclaw
- **URL:** https://github.com/madrzak/vidclaw
- **Features:** Secure self-hosted, dark theme, Kanban view, usage tracking
- **Adaptability:** ⭐⭐⭐ — Good feature set but needs more investigation on internals.

### 1.7 karem505/openclaw-agent-dashboard
- **URL:** https://github.com/karem505/openclaw-agent-dashboard
- **Features:** Single-file; Kanban boards, document editor, API monitoring, metrics
- **Adaptability:** ⭐⭐ — Single-file approach limits extensibility.

### 1.8 Curbob/LobsterBoard
- **URL:** https://github.com/Curbob/LobsterBoard
- **Tech Stack:** Node.js
- **Features:** Drag-and-drop builder, 60+ widgets, templates, custom pages, zero cloud deps
- **Adaptability:** ⭐⭐⭐ — Widget-based approach could be useful for a customizable dashboard.

---

## 2. AI Agent Orchestration Dashboards (General)

### 2.1 builderz-labs/mission-control ⭐ TOP PICK
- **URL:** https://github.com/builderz-labs/mission-control
- **Tech Stack:** Next.js 16, React 19, TypeScript 5.7 (strict), SQLite (WAL mode), Zustand, Recharts
- **Features:**
  - **26 monitoring/management panels** (tasks, agents, logs, tokens, memory, cron, alerts, webhooks, pipelines)
  - Real-time updates via WebSocket + SSE + intelligent polling
  - Multi-gateway connectivity (connect to multiple OpenClaw gateways)
  - Role-based access control (Viewer, Operator, Admin)
  - Quality gates / review system
  - Cost monitoring across agent operations
  - Zero external dependencies — `pnpm start` to run
  - **52 Playwright E2E tests**, CI pipeline
  - Security hardening: auth guards, rate limiting, XSS sanitization, SSRF protection, SQL injection prevention
- **Adaptability:** ⭐⭐⭐⭐⭐ — **This is the most mature and feature-complete option.** Already designed for OpenClaw multi-gateway orchestration. Could be deployed as-is or forked for customization.

### 2.2 steviebuilds/hive
- **URL:** https://github.com/steviebuilds/hive
- **Tech Stack:** Next.js 15, TypeScript
- **Features:** Beautiful dashboard for multi-agent workflows, task coordination, queue management
- **Adaptability:** ⭐⭐⭐ — Good UI reference, focused on autonomous coordination.

### 2.3 untra/operator
- **URL:** https://github.com/untra/operator
- **Features:** Real-time dashboard, queue view, active agents, completed work, human review, kanban-style tickets
- **Adaptability:** ⭐⭐⭐ — Good model for task dispatch and progress tracking.

### 2.4 getclawe/clawe
- **URL:** https://github.com/getclawe/clawe
- **Features:** Kanban-style task management, cron-scheduled agents with roles/personalities
- **Adaptability:** ⭐⭐⭐ — Interesting role/personality concept for agents.

### 2.5 simstudioai/sim
- **URL:** https://github.com/simstudioai/sim
- **Features:** Build, deploy, orchestrate AI agents; 1,000+ integrations
- **Adaptability:** ⭐⭐ — More of a full platform than a dashboard.

---

## 3. Claude Code Monitoring Dashboards

### 3.1 Claude-Code-Usage-Monitor
- **URL:** https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor
- **Features:** Terminal-based real-time dashboard, advanced analytics, ML predictions, rich UI, private (no data leaves machine)
- **Adaptability:** ⭐⭐ — Terminal-only, but good analytics reference.

### 3.2 claude-code-otel
- **URL:** https://github.com/ColeMurray/claude-code-otel
- **Features:**
  - OpenTelemetry stack for enterprise monitoring
  - Cost analysis by model/user
  - User analytics (DAU/WAU/MAU)
  - Tool usage, performance metrics (latency, success rates)
  - Token efficiency tracking
  - Live dashboards (30-second refresh)
- **Adaptability:** ⭐⭐⭐ — OTel approach is enterprise-grade. Could integrate OTel data into our dashboard.

### 3.3 TheAIuniversity/multi-agent-dashboard
- **URL:** https://github.com/TheAIuniversity/multi-agent-dashboard
- **Features:** Real-time observability for Claude Code agents, tracking, management, optimization of multi-agent workflows
- **Adaptability:** ⭐⭐⭐ — Directly relevant for Claude-based agent monitoring.

---

## 4. Supabase-Based Dashboards

### 4.1 Supaboard
- **URL:** https://github.com/supaboard/app
- **Features:** Dashboard builder for Supabase/Postgres, real-time capabilities
- **Adaptability:** ⭐⭐ — Generic dashboard builder, not agent-specific.

### 4.2 Dashibase
- **URL:** https://github.com/Dashibase/dashibase
- **Features:** Lightweight app-builder, presets, CRUD, card/table views, form validation
- **Adaptability:** ⭐⭐ — Could serve as a starting point for data management views.

### 4.3 Supabase Embedded Dashboard
- **URL:** https://github.com/supabase/supabase-embedded-dashboard
- **Tech Stack:** Next.js, shadcn/ui
- **Features:** Modern dashboard using Supabase Management API
- **Adaptability:** ⭐⭐ — Good UI reference for shadcn/ui + Supabase patterns.

---

## 5. Tech Stack Recommendation

### 5.1 Frontend Framework

| Framework | Pros | Cons | Verdict |
|-----------|------|------|---------|
| **Next.js 15+** | SSR/SSG, massive ecosystem, shadcn/ui, Recharts/Tremor, Railway auto-deploy, dominant in dashboard space | Heavier, Vercel-centric docs | ✅ **Recommended** |
| **Vite + React** | Fast dev, lightweight, flexible | No SSR out-of-box, manual routing | Good for SPA-only |
| **SvelteKit** | Smallest bundle, excellent DX, reactive | Smaller ecosystem, fewer dashboard UI kits | Good for MVPs |

**Winner: Next.js 15+ (App Router)** — Best ecosystem for dashboards, most existing OpenClaw dashboards use it, Railway deploys it seamlessly.

### 5.2 Database

| Database | Pros | Cons | Verdict |
|----------|------|------|---------|
| **Supabase** | Real-time subscriptions built-in, auth, Row Level Security, Postgres under the hood, generous free tier | External dependency, vendor lock-in risk | ✅ **Best for real-time + auth** |
| **SQLite** | Zero config, WAL mode performant, local-first, no external deps | Single-server only, no built-in real-time | Good for single-instance |
| **Postgres (Railway)** | Full SQL, Railway native, scalable | Need to build real-time layer yourself | Good with custom SSE |

**Winner: Supabase** — Real-time subscriptions out of the box eliminate the need to build WebSocket infrastructure. Auth included. Free tier sufficient for personal use.

**Alternative: SQLite** — If we want zero external dependencies (like builderz-labs/mission-control does). Simpler, but we'd need to build our own real-time layer.

### 5.3 Real-Time Updates

| Method | Latency | Scalability | Complexity | Best For |
|--------|---------|-------------|------------|----------|
| **SSE** | Low | High (standard HTTP) | Low | One-way server→client (dashboard updates) ✅ |
| **WebSocket** | Lowest | Medium (connection overhead) | Medium | Bidirectional (chat, commands) |
| **Polling** | High | Low | Lowest | Legacy only ❌ |
| **Supabase Realtime** | Low | High | Very Low | DB change subscriptions ✅ |

**Winner: SSE + Supabase Realtime** — SSE for streaming agent logs/events, Supabase Realtime for database change subscriptions. Add WebSocket only if we need bidirectional communication (e.g., sending commands to agents).

### 5.4 Deployment on Railway

Railway supports all options well:
- **Next.js:** Auto-detected via Nixpacks, `git push` deploys
- **Postgres:** Native Railway service, one-click provisioning
- **Supabase:** Can self-host on Railway or use hosted Supabase (recommended for simplicity)
- **Redis:** Available as Railway service if needed for caching

**Recommended Railway setup:**
1. Next.js app service (auto-deploy from GitHub)
2. Supabase (hosted, free tier) OR Railway Postgres + custom real-time
3. Optional: Redis for caching high-frequency metrics

---

## 6. Summary & Recommendation

### Option A: Fork builderz-labs/mission-control (Fastest Path)
- Already built for OpenClaw multi-gateway orchestration
- Next.js + SQLite + WebSocket/SSE
- 26 panels, RBAC, security hardening, E2E tests
- Deploy on Railway as-is, customize from there
- **Time to deploy: 1-2 hours. Time to customize: days.**

### Option B: Fork openclaw-studio + Add Monitoring (Medium Effort)
- Clean OpenClaw-specific UI as base
- Add monitoring panels, real-time updates, task management
- More control over architecture
- **Time to MVP: 1-2 weeks.**

### Option C: Build Custom (Maximum Control)
- **Stack:** Next.js 15 + TypeScript + Tailwind + shadcn/ui + Supabase + Recharts
- Full control over features and architecture
- Can integrate OpenClaw Gateway API, Slack webhooks, Vikunja sync
- **Time to MVP: 2-4 weeks.**

### 🏆 Recommendation

**Start with Option A (fork mission-control)** for immediate value, then evaluate if we need Option C for deeper customization. Mission-control already has the core features we'd want:
- Multi-agent monitoring
- Task dispatch and tracking
- Cost monitoring
- Real-time updates
- Security built-in

If mission-control doesn't fit after testing, pivot to **Option C** with the recommended tech stack (Next.js + Supabase + SSE).

---

## 7. Next Steps

1. [ ] Clone and test builderz-labs/mission-control locally
2. [ ] Connect it to our OpenClaw gateway
3. [ ] Evaluate gaps vs. our specific needs (Slack integration, Vikunja sync, custom metrics)
4. [ ] Decide: customize mission-control or build custom
5. [ ] If building custom: scaffold Next.js + Supabase project on Railway
