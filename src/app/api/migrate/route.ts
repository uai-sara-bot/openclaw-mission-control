/**
 * Database migration runner
 * POST /api/migrate - Creates all tables via Supabase REST API
 * 
 * Since we can't run arbitrary SQL via REST, we create tables by
 * inserting dummy rows and using Supabase's schema cache warmup trick.
 * Instead, we use the Supabase JS client with RPC to bootstrap.
 * 
 * For initial setup, tables must be created via Supabase Dashboard SQL editor.
 * This endpoint seeds the database with real OpenClaw data.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Real OpenClaw agents from openclaw.json
const OPENCLAW_AGENTS = [
  { id: 'main', name: 'Sara (Main)', model: 'anthropic/claude-opus-4-6', role: 'Primary assistant', channel: 'slack', status: 'idle' as const },
  { id: 'personal', name: 'Sara (Personal)', model: 'anthropic/claude-sonnet-4-6', role: 'Personal assistant', channel: 'slack', status: 'idle' as const },
  { id: 'mission-control', name: 'Sara Mission Control', model: 'anthropic/claude-sonnet-4-6', role: 'Dashboard management', channel: 'slack', status: 'idle' as const },
  { id: 'finance', name: 'Sara Finance', model: 'anthropic/claude-sonnet-4-6', role: 'Financial tracking', channel: 'slack', status: 'idle' as const },
  { id: 'engage-dev', name: 'ENGAGE Dev', model: 'anthropic/claude-sonnet-4-6', role: 'ENGAGE platform development', channel: 'slack', status: 'idle' as const },
  { id: 'research', name: 'Sara Research', model: 'anthropic/claude-sonnet-4-6', role: 'Research and analysis', channel: 'slack', status: 'idle' as const },
  { id: 'general-work', name: 'General Work', model: 'anthropic/claude-sonnet-4-5', role: 'General tasks', channel: 'slack', status: 'idle' as const },
  { id: 'openai-chat', name: 'OpenAI Chat', model: 'openai-codex/gpt-5.4', role: 'OpenAI model access', channel: 'slack', status: 'idle' as const },
  { id: 'gemini-chat', name: 'Gemini Chat', model: 'google/gemini-2.5-pro', role: 'Google Gemini access', channel: 'slack', status: 'idle' as const },
  { id: 'anthropic-chat', name: 'Anthropic Chat', model: 'anthropic/claude-sonnet-4-5', role: 'Direct Anthropic access', channel: 'slack', status: 'idle' as const },
  { id: 'sara-intimate', name: 'Sara Intimate', model: 'openrouter/gryphe/mythomax-l2-13b', role: 'Personal companion', channel: 'slack', status: 'idle' as const },
  { id: 'weather', name: 'Sara Weather', model: 'anthropic/claude-sonnet-4-6', role: 'Weather monitoring', channel: 'cron', status: 'idle' as const },
  { id: 'compare-llms', name: 'Compare LLMs', model: 'anthropic/claude-sonnet-4-5', role: 'LLM comparison', channel: 'slack', status: 'idle' as const },
]

// Cron jobs from OpenClaw
const CRON_JOBS = [
  { name: 'lahore-weather-check', schedule: '0 */4 * * *', description: 'Check Lahore weather every 4 hours and alert if rain expected', agent_name: 'main', enabled: true, color: '#3b82f6' },
  { name: 'nightly-memory-sync', schedule: '0 19 * * *', description: 'Sync agent memories from Slack channel history', agent_name: 'main', enabled: true, color: '#8b5cf6' },
  { name: 'nightly-config-backup', schedule: '0 18 * * *', description: 'Backup OpenClaw config to GitHub and OneDrive', agent_name: 'main', enabled: true, color: '#22c55e' },
  { name: 'daily-memory', schedule: '0 20 * * *', description: 'Write daily memory file with session summary', agent_name: 'mission-control', enabled: true, color: '#f97316' },
]

export async function POST(req: NextRequest) {
  const results: Record<string, { success: boolean; count?: number; error?: string }> = {}

  // Seed agents
  try {
    const { error } = await supabase.from('agents').upsert(
      OPENCLAW_AGENTS.map(a => ({
        ...a,
        machine: 'railway-openclaw',
        last_active: new Date().toISOString(),
        token_usage_today: 0,
      })),
      { onConflict: 'id' }
    )
    if (error) throw error
    results.agents = { success: true, count: OPENCLAW_AGENTS.length }
  } catch (e: unknown) {
    results.agents = { success: false, error: e instanceof Error ? e.message : String(e) }
  }

  // Seed cron jobs
  try {
    const { error } = await supabase.from('cron_jobs').upsert(
      CRON_JOBS.map(c => ({
        ...c,
        run_count: 0,
        next_run: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      })),
      { onConflict: 'name' }
    )
    if (error) throw error
    results.cron_jobs = { success: true, count: CRON_JOBS.length }
  } catch (e: unknown) {
    results.cron_jobs = { success: false, error: e instanceof Error ? e.message : String(e) }
  }

  // Check existing counts
  const tables = ['agents', 'tasks', 'activity_events', 'memory_entries', 'cron_jobs', 'notifications', 'costs', 'approvals', 'projects', 'people']
  const counts: Record<string, number> = {}
  
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
    counts[table] = count || 0
  }

  return NextResponse.json({ 
    ok: true, 
    results,
    counts,
    message: 'Seed complete. Tables must be created via Supabase Dashboard SQL editor first.'
  })
}

export async function GET() {
  // Health check - verify tables exist
  const tables = ['agents', 'tasks', 'activity_events', 'memory_entries', 'cron_jobs']
  const status: Record<string, boolean> = {}
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    status[table] = !error || error.code !== 'PGRST205'
  }

  return NextResponse.json({ status, tablesReady: Object.values(status).every(Boolean) })
}
