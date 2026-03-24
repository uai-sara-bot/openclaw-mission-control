'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, CheckCircle, XCircle, AlertTriangle, Calendar, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CronJob {
  id: string
  name: string
  description?: string
  schedule: string
  schedule_human?: string
  timezone?: string
  status: 'enabled' | 'disabled'
  last_run?: string
  next_run?: string
  agent_id?: string
  agent_name?: string
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

const statusConfig = {
  success: { icon: CheckCircle, color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10', label: 'Success' },
  failed: { icon: XCircle, color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10', label: 'Failed' },
  skipped: { icon: AlertTriangle, color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10', label: 'Skipped' },
}

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
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
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  })
}

function formatDuration(ms: number) {
  if (!ms || ms === 0) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function CalendarPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [historyFilter, setHistoryFilter] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [{ data: jobData, error: jobError }, { data: historyData }] = await Promise.all([
        supabase.from('cron_jobs').select('*').order('name'),
        supabase.from('cron_run_history').select('*').order('started_at', { ascending: false }).limit(50),
      ])
      if (jobError) console.error('Cron jobs fetch error:', jobError)
      if (jobData) setJobs(jobData)
      if (historyData) setRunHistory(historyData)
      setLoading(false)
    }
    fetchData()

    const jobSub = supabase
      .channel('cron-jobs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cron_jobs' }, (payload) => {
        if (payload.eventType === 'INSERT') setJobs(prev => [...prev, payload.new as CronJob])
        if (payload.eventType === 'UPDATE') setJobs(prev => prev.map(j => j.id === (payload.new as CronJob).id ? payload.new as CronJob : j))
        if (payload.eventType === 'DELETE') setJobs(prev => prev.filter(j => j.id !== (payload.old as CronJob).id))
      })
      .subscribe()

    const historySub = supabase
      .channel('cron-history-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cron_run_history' }, (payload) => {
        setRunHistory(prev => [payload.new as RunHistoryEntry, ...prev.slice(0, 49)])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(jobSub)
      supabase.removeChannel(historySub)
    }
  }, [])

  async function toggleJob(id: string) {
    const job = jobs.find(j => j.id === id)
    if (!job) return
    const newStatus = job.status === 'enabled' ? 'disabled' : 'enabled'
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j))
    await supabase.from('cron_jobs').update({ status: newStatus }).eq('id', id)
  }

  const filteredHistory = historyFilter
    ? runHistory.filter(r => r.job_id === historyFilter)
    : runHistory

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-teal-400 animate-pulse">Loading schedule...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {jobs.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-12 text-center">
          <Calendar size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
          <p className="text-sm text-[var(--text-muted)]">No scheduled jobs yet.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">Cron jobs registered by agents will appear here.</p>
        </div>
      ) : (
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
                    {job.description && (
                      <p className="text-xs text-[var(--text-secondary)] mb-3">{job.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Timer size={12} className="text-[var(--text-muted)]" />
                        <code className="font-mono text-[var(--accent-purple)]">{job.schedule}</code>
                        {job.schedule_human && (
                          <span className="text-[var(--text-muted)]">— {job.schedule_human}</span>
                        )}
                      </div>
                      {job.timezone && (
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                          <span>TZ:</span>
                          <span className="text-[var(--text-secondary)]">{job.timezone}</span>
                        </div>
                      )}
                      {job.agent_name && (
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                          <span>Agent:</span>
                          <span className="text-[var(--text-secondary)]">{job.agent_name}</span>
                        </div>
                      )}
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
                <button
                  onClick={() => toggleJob(job.id)}
                  aria-label={`${job.status === 'enabled' ? 'Disable' : 'Enable'} ${job.name}`}
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors shrink-0 mt-1',
                    job.status === 'enabled' ? 'bg-[var(--accent-blue)]' : 'bg-[var(--border)]'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                    job.status === 'enabled' ? 'left-[22px]' : 'left-0.5'
                  )} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Run History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Run History</h2>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setHistoryFilter(null)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs transition-colors',
                historyFilter === null ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                  historyFilter === job.id ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                {job.name}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              {runHistory.length === 0 ? 'No run history yet — jobs will log here after they execute.' : 'No run history for this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map(run => {
              const config = statusConfig[run.status] || statusConfig.skipped
              const Icon = config.icon
              return (
                <div key={run.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 hover:border-[var(--accent-blue)]/20 transition-colors">
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
                      {run.message && (
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{run.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Showing {filteredHistory.length} of {runHistory.length} runs
      </p>
    </div>
  )
}
