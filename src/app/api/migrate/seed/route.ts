/**
 * Seed the database with real OpenClaw memory files content
 * POST /api/migrate/seed
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Memory entries from the actual /data/.openclaw/memory/*.md files
// These are seeded at build time from real files
const MEMORY_ENTRIES = [
  { date: '2026-03-08', word_count: 164, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-08 — First Session\n\n## Setup Done\n- Named myself Sara\n- Browser working on Railway\n- SearXNG meta-search available\n- GitHub token configured for uai-sara-bot\n- Access to UAI-Engage org (6 private + 5 public repos)\n\n## About Awais\n- Timezone: PKT (UTC+5)\n- Project: Uraan AI (C4I systems for unmanned systems)' },
  { date: '2026-03-09', word_count: 470, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-09 — Day 2\n\n## Completed\n- Set up MEMORY.md with all context\n- Configured Telegram and Slack channels\n- Tested multi-agent setup\n- Verified GitHub access to UAI-Engage org' },
  { date: '2026-03-12', word_count: 462, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-12 — Infrastructure\n\n## Work Done\n- Configured Personal Sara agent on #personal channel\n- Set up OpenAI chat agent with GPT-5.4\n- Added Gemini agent with Gemini 2.5 Pro\n- Verified all agents responding in their channels' },
  { date: '2026-03-13', word_count: 467, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-13 — OpenClaw Upgrade\n\n## Changes\n- Upgraded to OpenClaw 2026.3.13\n- ACPX plugin installed and configured\n- Claude Code CLI authenticated via OAuth\n- ACP runtime working for spawning sub-agents' },
  { date: '2026-03-14', word_count: 430, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-14 — Memory Sync\n\n## Work Done\n- Set up nightly memory sync cron job\n- Configured gap-proof Slack message sync\n- All 13 agents included in sync\n- MEMORY.md updated with full context' },
  { date: '2026-03-16', word_count: 92, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-16 — WorldView OSS\n\n## Deployed\n- WorldView OSS on Railway (3D globe dashboard)\n- URL rotated to worldview-f19c7ba4-production.up.railway.app\n- General Work agent handled deployment' },
  { date: '2026-03-17', word_count: 1217, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-17 — Multi-Agent Day\n\n## Setup Done\n- Vikunja todo app deployed on Railway\n- Finance agent configured on #finance channel\n- Sure API integration tested\n- OneDrive sync via Maton.ai\n- Labels created: High/Medium/Low Priority, Long-Term' },
  { date: '2026-03-19', word_count: 273, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-19 — AnythingLLM\n\n## ENGAGE Workspace\n- AnythingLLM configured at anythingllm-production-aea3.up.railway.app\n- ENGAGE workspace created with 256 docs\n- Duplicates cleaned (476 removed)\n- topN bumped to 20 for comprehensive answers' },
  { date: '2026-03-20', word_count: 595, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-20 — Mission Control Research\n\n## Research Done\n- Analyzed Alex Finn YouTube video on building MC\n- Evaluated 8 existing OpenClaw dashboard projects\n- Selected Next.js + Supabase stack\n- Plan created for custom dashboard build' },
  { date: '2026-03-21', word_count: 513, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-21 — Mission Control Build Start\n\n## Progress\n- Repo created: github.com/uai-sara-bot/openclaw-mission-control\n- Next.js 15 scaffolded with TypeScript + Tailwind\n- Dark theme design system created\n- Left sidebar with 12 pages built\n- Railway service deployed' },
  { date: '2026-03-22', word_count: 494, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-22 — MC Audit & Enhancement\n\n## Work Done\n- Opus 4.6 audit of all code (PR #1 merged)\n- 3 parallel agents built: Personas, Task Management, Theme\n- Agent Personas page built (8 personas)\n- Weather cron job added (every 4 hours)\n- GoDaddy API access attempted (blocked by cloud IP policy)' },
  { date: '2026-03-23', word_count: 1236, entry_type: 'daily', agent_name: 'main', content: '# 2026-03-23 — Supabase & Real Data\n\n## Major Work\n- Supabase project provisioned: advxcrconarkrhfzstlf.supabase.co\n- Real data backend subagent spawned\n- Frontend data wiring subagent spawned\n- Railway env vars configured with Supabase keys\n- Eid al-Fitr celebrated (Awais confirmed Saturday March 21)\n- AnythingLLM TTS upgraded to ElevenLabs Jessica voice\n- STT upgraded to whisper-large (local, no cost)' },
]

// Real projects from OpenClaw memory
const REAL_PROJECTS = [
  { name: 'ENGAGE Platform', status: 'active' as const, description: 'C4ISR military platform by Uraan AI. Web-based ops center with 3D/2D mapping, UAV control, missile defense. 480+ features, 13 modules.', progress: 35, assignee: 'Awais', priority: 'high' },
  { name: 'Mission Control Dashboard', status: 'active' as const, description: 'Custom OpenClaw Mission Control dashboard. Next.js 15 + TypeScript + Tailwind + Supabase. Real-time agent monitoring.', progress: 60, assignee: 'Sara', priority: 'high' },
  { name: 'LiveKit Voice Agent', status: 'planning' as const, description: 'Real-time voice calling system so Awais can talk to Sara live via WebRTC. LiveKit Server deployed, voice agent pending.', progress: 30, assignee: 'Sara', priority: 'medium' },
  { name: 'Vikunja Todo Integration', status: 'running' as const, description: 'Slack #todo ↔ Sara ↔ Vikunja API ↔ OneDrive sync pipeline. Auto-sync every 30 minutes.', progress: 90, assignee: 'Sara', priority: 'medium' },
  { name: 'Finance Tracking (Sure)', status: 'active' as const, description: 'Sure personal finance app (fork of Maybe Finance). Sara logs transactions via #finance Slack channel.', progress: 50, assignee: 'Sara', priority: 'low' },
]

export async function POST() {
  const results: Record<string, { success: boolean; count?: number; error?: string }> = {}

  // Seed memory entries
  try {
    const { error } = await supabase.from('memory_entries').upsert(
      MEMORY_ENTRIES.map(m => ({
        ...m,
        date: m.date,
      })),
      { onConflict: 'date,agent_name' }
    )
    if (error) throw error
    results.memory_entries = { success: true, count: MEMORY_ENTRIES.length }
  } catch (e: unknown) {
    results.memory_entries = { success: false, error: e instanceof Error ? e.message : String(e) }
  }

  // Seed projects
  try {
    const { error } = await supabase.from('projects').upsert(
      REAL_PROJECTS,
      { onConflict: 'name' }
    )
    if (error) throw error
    results.projects = { success: true, count: REAL_PROJECTS.length }
  } catch (e: unknown) {
    results.projects = { success: false, error: e instanceof Error ? e.message : String(e) }
  }

  // Seed initial notification
  try {
    const { error } = await supabase.from('notifications').insert({
      type: 'info',
      title: 'Mission Control initialized',
      message: 'Real data backend connected. Tables seeded with OpenClaw data.',
      agent_name: 'mission-control',
      read: false
    })
    if (error && !error.message?.includes('duplicate')) throw error
    results.notifications = { success: true, count: 1 }
  } catch (e: unknown) {
    results.notifications = { success: false, error: e instanceof Error ? e.message : String(e) }
  }

  return NextResponse.json({ ok: true, results })
}
