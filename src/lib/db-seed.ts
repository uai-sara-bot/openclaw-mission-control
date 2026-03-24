/**
 * Database seed runner
 * Called from instrumentation.ts on server startup
 * Seeds real OpenClaw data into Supabase tables
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

const OPENCLAW_AGENTS = [
  { id: 'main', name: 'Sara (Main)', model: 'anthropic/claude-opus-4-6', role: 'Primary assistant', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'personal', name: 'Sara (Personal)', model: 'anthropic/claude-sonnet-4-6', role: 'Personal assistant', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'mission-control', name: 'Sara Mission Control', model: 'anthropic/claude-sonnet-4-6', role: 'Dashboard management', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'finance', name: 'Sara Finance', model: 'anthropic/claude-sonnet-4-6', role: 'Financial tracking', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'engage-dev', name: 'ENGAGE Dev', model: 'anthropic/claude-sonnet-4-6', role: 'ENGAGE platform development', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'research', name: 'Sara Research', model: 'anthropic/claude-sonnet-4-6', role: 'Research and analysis', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'general-work', name: 'General Work', model: 'anthropic/claude-sonnet-4-5', role: 'General tasks', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'openai-chat', name: 'OpenAI Chat', model: 'openai-codex/gpt-5.4', role: 'OpenAI model access', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'gemini-chat', name: 'Gemini Chat', model: 'google/gemini-2.5-pro', role: 'Google Gemini access', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'anthropic-chat', name: 'Anthropic Chat', model: 'anthropic/claude-sonnet-4-5', role: 'Direct Anthropic access', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'sara-intimate', name: 'Sara Intimate', model: 'openrouter/gryphe/mythomax-l2-13b', role: 'Personal companion', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'weather', name: 'Sara Weather', model: 'anthropic/claude-sonnet-4-6', role: 'Weather monitoring', channel: 'cron', status: 'idle' as const, machine: 'railway-openclaw' },
  { id: 'compare-llms', name: 'Compare LLMs', model: 'anthropic/claude-sonnet-4-5', role: 'LLM comparison', channel: 'slack', status: 'idle' as const, machine: 'railway-openclaw' },
]

const CRON_JOBS = [
  { name: 'lahore-weather-check', schedule: '0 */4 * * *', description: 'Check Lahore weather every 4 hours', agent_name: 'main', enabled: true, color: '#3b82f6', run_count: 0 },
  { name: 'nightly-memory-sync', schedule: '0 19 * * *', description: 'Sync agent memories from Slack history', agent_name: 'main', enabled: true, color: '#8b5cf6', run_count: 0 },
  { name: 'nightly-config-backup', schedule: '0 18 * * *', description: 'Backup OpenClaw config to GitHub + OneDrive', agent_name: 'main', enabled: true, color: '#22c55e', run_count: 0 },
  { name: 'daily-memory', schedule: '0 20 * * *', description: 'Write daily memory file with session summary', agent_name: 'mission-control', enabled: true, color: '#f97316', run_count: 0 },
]

export async function seedRealData() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.log('[db-seed] Supabase not configured, skipping seed')
    return
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  // Check if agents table exists
  const { error: checkError } = await supabase.from('agents').select('id').limit(1)
  if (checkError?.code === 'PGRST205') {
    console.log('[db-seed] Tables not yet created. Run SQL from supabase/migrations/001_create_tables.sql in Supabase Dashboard')
    return
  }

  // Seed agents (upsert - safe to run multiple times)
  const { error: agentsError } = await supabase.from('agents').upsert(OPENCLAW_AGENTS, { onConflict: 'id' })
  if (agentsError) {
    console.error('[db-seed] Error seeding agents:', agentsError.message)
  } else {
    console.log(`[db-seed] ✓ Seeded ${OPENCLAW_AGENTS.length} agents`)
  }

  // Seed cron jobs
  const { error: cronError } = await supabase.from('cron_jobs').upsert(CRON_JOBS, { onConflict: 'name' })
  if (cronError) {
    console.error('[db-seed] Error seeding cron_jobs:', cronError.message)
  } else {
    console.log(`[db-seed] ✓ Seeded ${CRON_JOBS.length} cron jobs`)
  }

  console.log('[db-seed] Seed complete')
}
