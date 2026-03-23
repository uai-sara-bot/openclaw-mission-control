'use client'

import { useState } from 'react'
import { CronJob } from '@/types'
import {
  Clock, Play, Pause, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, Calendar, Timer
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CronJobExtended extends CronJob {
  description: string
  timezone: string
  agent_name: string
  schedule_human: string
}

interface RunHistoryEntry {
  id: string
  job_id: string
  job_name: string
  status: 'success' | 'failed' | 'skipped'
  started_at: string
  duration_ms: number
  message: string
}

const cronJobs: CronJobExtended[] = [
  {
    id: '1',
    name: 'Nightly Memory Sync',
    description: 'Syncs all agent memory files to Supabase backup and consolidates shared knowledge base.',
    schedule: '0 19 * * *',
    schedule_human: 'Every day at 7:00 PM UTC',
    timezone: 'UTC',
    status: 'enabled',
    last_run: '2026-03-22T19:00:00Z',
    next_run: '2026-03-23T19:00:00Z',
    agent_id: '1',
    agent_name: 'main',
  },
  {
    id: '2',
    name: 'Nightly Config Backup',
    description: 'Backs up all agent configurations, environment settings, and gateway routing rules.',
    schedule: '0 23 * * *',
    schedule_human: 'Every day at 11:00 PM PKT',
    timezone: 'Asia/Karachi',
    status: 'enabled',
    last_run: '2026-03-22T18:00:00Z',
    next_run: '2026-03-23T18:00:00Z',
    agent_id: '1',
    agent_name: 'main',
  },
  {
    id: '3',
    name: 'Lahore Weather Check',
    description: 'Fetches current weather data for Lahore and posts summary to the personal channel.',
    schedule: '0 */4 * * *',
    schedule_human: 'Every 4 hours (PKT)',
    timezone: 'Asia/Karachi',
    status: 'enabled',
    last_run: '2026-03-23T11:00:00Z',
    next_run: '2026-03-23T15:00:00Z',
    agent_id: '2',
    agent_name: 'personal',
  },
]

const runHistory: RunHistoryEntry[] = [
  { id: 'r1', job_id: '3', job_name: 'Lahore Weather Check', status: 'success', started_at: '2026-03-23T11:00:00Z', duration_ms: 2340, message: 'Weather data fetched and posted. Lahore: 28°C, partly cloudy.' },
  { id: 'r2', job_id: '3', job_name: 'Lahore Weather Check', status: 'success', started_at: '2026-03-23T07:00:00Z', duration_ms: 1890, message: 'Weather data fetched and posted. Lahore: 22°C, clear.' },
  { id: 'r3', job_id: '1', job_name: 'Nightly Memory Sync', status: 'success', started_at: '2026-03-22T19:00:00Z', duration_ms: 14520, message: 'Synced 13 agent memory files (47 KB total). No conflicts detected.' },
  { id: 'r4', job_id: '2', job_name: 'Nightly Config Backup', status: 'success', started_at: '2026-03-22T18:00:00Z', duration_ms: 8730, message: 'Backed up 13 configs and 4 routing rules to Supabase.' },
  { id: 'r5', job_id: '3', job_name: 'Lahore Weather Check', status: 'failed', started_at: '2026-03-23T03:00:00Z', duration_ms: 30120, message: 'Timeout: weather API did not respond within 30s.' },
  { id: 'r6', job_id: '3', job_name: 'Lahore Weather Check', status: 'success', started_at: '2026-03-22T23:00:00Z', duration_ms: 2100, message: 'Weather data fetched and posted. Lahore: 19°C, clear.' },
  { id: 'r7', job_id: '1', job_name: 'Nightly Memory Sync', status: 'success', started_at: '2026-03-21T19:00:00Z', duration_ms: 13200, message: 'Synced 13 agent memory files (45 KB total). No conflicts detected.' },
  { id: 'r8', job_id: '2', job_name: 'Nightly Config Backup', status: 'skipped', started_at: '2026-03-21T18:00:00Z', duration_ms: 0, message: 'Skipped: no config changes since last backup.' },
]

const statusConfig = {
  success: { icon: CheckCircle, color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10', label: 'Success' },
  failed: { icon: XCircle, color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10', label: 'Failed' },
  skipped: { icon: AlertTriangle, color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10', label: 'Skipped' },
}

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date('2026-03-23T13:00:00Z')
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 0) {
    const absMin = Math.abs(diffMin)
    if (absMin < 60) return `in ${absMin}m`
    const absHr = Math.floor(absMin / 60)
    return `in ${absHr}h`
  }
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  return `${diffDays}d ago`
}

function formatDateTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  })
}

function formatDuration(ms: number) {
  if (ms === 0) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function CalendarPage() {
  const [jobs, setJobs] = useState(cronJobs)
  const [historyFilter, setHistoryFilter] = useState<string | null>(null)

  function toggleJob(id: string) {
    setJobs(prev => prev.map(j =>
      j.id === id ? { ...j, status: j.status === 'enabled' ? 'disabled' : 'enabled' } as CronJobExtended : j
    ))
  }

  const filteredHistory = historyFilter
    ? runHistory.filter(r => r.job_id === historyFilter)
    : runHistory

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Calendar / Cron</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Scheduled jobs and run history</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Clock size={14} />
          {jobs.filter(j => j.status === 'enabled').length} active jobs
        </div>
      </div>

      {/* Cron Jobs */}
      <div className="space-y-3">
        {jobs.map(job => (
          <div
            key={job.id}
            className={cn(
              'bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5 transition-colors',
              job.status === 'disabled' && 'opacity-60'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                  job.status === 'enabled' ? 'bg-[var(--accent-blue)]/10' : 'bg-white/5'
                )}>
                  <Calendar size={18} className={job.status === 'enabled' ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)]'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">{job.name}</h3>
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-medium',
                      job.status === 'enabled'
                        ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]'
                        : 'bg-white/5 text-[var(--text-muted)]'
                    )}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-3">{job.description}</p>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Timer size={12} className="text-[var(--text-muted)]" />
                      <code className="font-mono text-[var(--accent-purple)]">{job.schedule}</code>
                      <span className="text-[var(--text-muted)]">— {job.schedule_human}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <span>TZ:</span>
                      <span className="text-[var(--text-secondary)]">{job.timezone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                      <span>Agent:</span>
                      <span className="text-[var(--text-secondary)]">{job.agent_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 mt-3 text-xs text-[var(--text-muted)]">
                    {job.last_run && (
                      <div>
                        Last run: <span className="text-[var(--text-secondary)] font-mono">{formatDateTime(job.last_run)}</span>
                        <span className="ml-1">({formatRelativeTime(job.last_run)})</span>
                      </div>
                    )}
                    {job.next_run && job.status === 'enabled' && (
                      <div>
                        Next run: <span className="text-[var(--accent-blue)] font-mono">{formatDateTime(job.next_run)}</span>
                        <span className="ml-1">({formatRelativeTime(job.next_run)})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggleJob(job.id)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors shrink-0 mt-1',
                  job.status === 'enabled' ? 'bg-[var(--accent-blue)]' : 'bg-[var(--border)]'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                    job.status === 'enabled' ? 'left-[22px]' : 'left-0.5'
                  )}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Run History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Run History</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setHistoryFilter(null)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs transition-colors',
                historyFilter === null
                  ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              All
            </button>
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => setHistoryFilter(historyFilter === job.id ? null : job.id)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs transition-colors',
                  historyFilter === job.id
                    ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                    : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {job.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredHistory.length === 0 ? (
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-8 text-center">
              <p className="text-sm text-[var(--text-muted)]">No run history for this filter.</p>
            </div>
          ) : (
            filteredHistory.map(run => {
              const config = statusConfig[run.status]
              const Icon = config.icon
              return (
                <div
                  key={run.id}
                  className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 hover:border-[var(--accent-blue)]/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
                      <Icon size={16} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{run.job_name}</span>
                        <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', config.bg, config.color)}>
                          {config.label}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">{formatDuration(run.duration_ms)}</span>
                        <span className="ml-auto text-xs text-[var(--text-muted)] shrink-0 font-mono">
                          {formatDateTime(run.started_at)} ({formatRelativeTime(run.started_at)})
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{run.message}</p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-[var(--text-muted)] text-center">
        Showing {filteredHistory.length} of {runHistory.length} runs
      </p>
    </div>
  )
}
