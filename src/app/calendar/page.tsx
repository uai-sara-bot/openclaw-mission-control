'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, CheckCircle, XCircle, AlertTriangle, Calendar, Timer, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CronJob {
  id: string
  name: string
  description?: string
  schedule: string
  schedule_human?: string
  timezone?: string
  color?: string
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

const JOB_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#14b8a6']

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
    return `in ${Math.floor(absMin / 60)}h`
  }
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return `${Math.floor(diffHr / 24)}d ago`
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

// Parse cron to get run times for each day of the week (returns PKT times)
function getCronRunTimes(schedule: string): { day: number; hour: number; minute: number }[] {
  const parts = schedule.trim().split(/\s+/)
  if (parts.length < 5) return []
  const [min, hour, , , dow] = parts
  const times: { day: number; hour: number; minute: number }[] = []

  for (let day = 0; day < 7; day++) {
    let dayMatches = false
    if (dow === '*') {
      dayMatches = true
    } else if (dow.includes('/')) {
      dayMatches = true // every N days
    } else {
      dayMatches = dow.split(',').includes(String(day))
    }
    if (!dayMatches) continue

    const parsedMin = parseInt(min) || 0

    if (hour.includes('/')) {
      const interval = parseInt(hour.split('/')[1])
      for (let h = 0; h < 24; h += interval) {
        const pktHour = (h + 5) % 24
        times.push({ day, hour: pktHour, minute: parsedMin })
      }
    } else if (hour !== '*') {
      const h = parseInt(hour)
      const pktHour = (h + 5) % 24
      times.push({ day, hour: pktHour, minute: parsedMin })
    }
  }
  return times
}

function getWeekDates(weekOffset: number): Date[] {
  const now = new Date()
  const monday = new Date(now)
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // Mon=0
  monday.setDate(now.getDate() - dayOfWeek + weekOffset * 7)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
// Show hours 6am–11pm PKT
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6..23

interface CalendarEvent {
  job: CronJob
  color: string
  day: number // 0=Mon, 6=Sun (matches getWeekDates index)
  hour: number
  minute: number
}

export default function CalendarPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [historyFilter, setHistoryFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'week' | 'today'>('week')
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [{ data: jobData }, { data: historyData }] = await Promise.all([
        supabase.from('cron_jobs').select('*').order('name'),
        supabase.from('cron_run_history').select('*').order('started_at', { ascending: false }).limit(50),
      ])
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

  // Build calendar events
  const calendarEvents: CalendarEvent[] = []
  jobs.filter(j => j.status === 'enabled').forEach((job, idx) => {
    const color = job.color || JOB_COLORS[idx % JOB_COLORS.length]
    const times = getCronRunTimes(job.schedule)
    times.forEach(t => {
      // Convert cron day (0=Sun) to our index (0=Mon)
      const mappedDay = t.day === 0 ? 6 : t.day - 1
      calendarEvents.push({ job, color, day: mappedDay, hour: t.hour, minute: t.minute })
    })
  })

  const weekDates = getWeekDates(weekOffset)
  const todayIdx = (() => {
    const now = new Date()
    const d = now.getDay() === 0 ? 6 : now.getDay() - 1
    return d
  })()

  // Compute next 3 upcoming runs
  const now = new Date()
  const nowPKT = new Date(now.getTime() + 5 * 60 * 60 * 1000) // approx PKT
  const nowHour = nowPKT.getUTCHours()
  const nowMin = nowPKT.getUTCMinutes()
  const nowDay = nowPKT.getUTCDay() === 0 ? 6 : nowPKT.getUTCDay() - 1

  const upcomingEvents = calendarEvents
    .filter(e => {
      if (e.day > nowDay) return true
      if (e.day === nowDay && e.hour > nowHour) return true
      if (e.day === nowDay && e.hour === nowHour && e.minute > nowMin) return true
      return false
    })
    .sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day
      if (a.hour !== b.hour) return a.hour - b.hour
      return a.minute - b.minute
    })
    .slice(0, 3)

  const filteredHistory = historyFilter
    ? runHistory.filter(r => r.job_id === historyFilter)
    : runHistory

  const daysToShow = viewMode === 'today' ? [todayIdx] : [0, 1, 2, 3, 4, 5, 6]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-teal-400 animate-pulse">Loading schedule...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Calendar / Cron</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Scheduled jobs — PKT (UTC+5)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
            <button
              onClick={() => setViewMode('week')}
              className={cn('px-3 py-1.5 transition-colors', viewMode === 'week' ? 'bg-[var(--accent-blue)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('today')}
              className={cn('px-3 py-1.5 transition-colors', viewMode === 'today' ? 'bg-[var(--accent-blue)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
            >
              Today
            </button>
          </div>
          {viewMode === 'week' && (
            <div className="flex items-center gap-1">
              <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded hover:bg-white/5 text-[var(--text-muted)]">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-[var(--text-secondary)] min-w-[80px] text-center">
                {weekOffset === 0 ? 'This week' : weekOffset === 1 ? 'Next week' : weekOffset === -1 ? 'Last week' : `${weekOffset > 0 ? '+' : ''}${weekOffset}w`}
              </span>
              <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded hover:bg-white/5 text-[var(--text-muted)]">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-12 text-center">
          <Calendar size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
          <p className="text-sm text-[var(--text-muted)]">No scheduled jobs yet.</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="flex items-center gap-3 flex-wrap">
            {jobs.map((job, idx) => (
              <div key={job.id} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-sm" style={{ background: job.color || JOB_COLORS[idx % JOB_COLORS.length] }} />
                <span className="text-[var(--text-secondary)]">{job.name}</span>
                {job.schedule_human && <span className="text-[var(--text-muted)]">({job.schedule_human})</span>}
              </div>
            ))}
          </div>

          {/* Weekly grid */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
            {/* Day headers */}
            <div className={cn('grid border-b border-[var(--border)]', viewMode === 'today' ? 'grid-cols-[48px_1fr]' : 'grid-cols-[48px_repeat(7,1fr)]')}>
              <div className="p-2 text-xs text-[var(--text-muted)] text-center">PKT</div>
              {daysToShow.map(dayIdx => {
                const date = weekDates[dayIdx]
                const isToday = date.toDateString() === new Date().toDateString()
                return (
                  <div
                    key={dayIdx}
                    className={cn(
                      'p-2 text-center border-l border-[var(--border)]',
                      isToday && 'bg-[var(--accent-blue)]/5'
                    )}
                  >
                    <div className={cn('text-xs font-medium', isToday ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)]')}>
                      {DAY_LABELS[dayIdx]}
                    </div>
                    <div className={cn('text-[10px]', isToday ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)]')}>
                      {date.getDate()}/{date.getMonth() + 1}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Hour rows */}
            <div className="overflow-y-auto max-h-[480px]">
              {HOURS.map(hour => {
                const isCurrentHour = (() => {
                  const nowPKT2 = new Date(new Date().getTime() + 5 * 60 * 60 * 1000)
                  return nowPKT2.getUTCHours() === hour
                })()
                return (
                  <div
                    key={hour}
                    className={cn(
                      'grid border-b border-[var(--border)]',
                      viewMode === 'today' ? 'grid-cols-[48px_1fr]' : 'grid-cols-[48px_repeat(7,1fr)]',
                      isCurrentHour && 'bg-[var(--accent-blue)]/3'
                    )}
                    style={{ minHeight: 36 }}
                  >
                    <div className="p-1 text-[10px] text-[var(--text-muted)] text-right pr-2 pt-1.5 leading-none shrink-0">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {daysToShow.map(dayIdx => {
                      const cellEvents = calendarEvents.filter(e => e.day === dayIdx && e.hour === hour)
                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            'border-l border-[var(--border)] p-0.5 flex flex-wrap gap-0.5',
                            weekDates[dayIdx]?.toDateString() === new Date().toDateString() && 'bg-[var(--accent-blue)]/3'
                          )}
                          style={{ minHeight: 36 }}
                        >
                          {cellEvents.map((ev, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedEvent(ev)}
                              className="text-[9px] font-medium px-1 py-0.5 rounded truncate max-w-full leading-tight text-left"
                              style={{
                                background: ev.color + '30',
                                color: ev.color,
                                border: `1px solid ${ev.color}50`,
                                maxWidth: '100%',
                                width: '100%',
                              }}
                              title={`${ev.job.name} at ${hour.toString().padStart(2,'0')}:${ev.minute.toString().padStart(2,'0')} PKT`}
                            >
                              {ev.job.name.split('-').slice(-1)[0]} {ev.minute > 0 ? `:${ev.minute.toString().padStart(2,'0')}` : ''}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Next Up */}
          {upcomingEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Next Up</h3>
              <div className="flex gap-3 flex-wrap">
                {upcomingEvents.map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs"
                    style={{ borderColor: ev.color + '40', background: ev.color + '10' }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: ev.color }} />
                    <span style={{ color: ev.color }} className="font-medium">{ev.job.name}</span>
                    <span className="text-[var(--text-muted)]">
                      {DAY_LABELS[ev.day]} {ev.hour.toString().padStart(2,'0')}:{ev.minute.toString().padStart(2,'0')} PKT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job list with toggles */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">All Jobs</h3>
            <div className="space-y-2">
              {jobs.map((job, idx) => (
                <div
                  key={job.id}
                  className={cn(
                    'bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4',
                    job.status === 'disabled' && 'opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0 mt-1"
                        style={{ background: job.color || JOB_COLORS[idx % JOB_COLORS.length] }}
                      />
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
                        {job.description && <p className="text-xs text-[var(--text-secondary)] mb-2">{job.description}</p>}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Timer size={12} className="text-[var(--text-muted)]" />
                            <code className="font-mono text-[var(--accent-purple)]">{job.schedule}</code>
                            {job.schedule_human && <span className="text-[var(--text-muted)]">— {job.schedule_human}</span>}
                          </div>
                          {job.timezone && <span className="text-[var(--text-muted)]">{job.timezone}</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                          {job.last_run && (
                            <span>Last: <span className="text-[var(--text-secondary)] font-mono">{formatDateTime(job.last_run)}</span> ({formatRelativeTime(job.last_run)})</span>
                          )}
                          {job.next_run && job.status === 'enabled' && (
                            <span>Next: <span className="text-[var(--accent-blue)] font-mono">{formatDateTime(job.next_run)}</span> ({formatRelativeTime(job.next_run)})</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleJob(job.id)}
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
          </div>
        </>
      )}

      {/* Run History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Run History</h2>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setHistoryFilter(null)}
              className={cn('px-2.5 py-1 rounded-md text-xs transition-colors', historyFilter === null ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
            >
              All
            </button>
            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => setHistoryFilter(historyFilter === job.id ? null : job.id)}
                className={cn('px-2.5 py-1 rounded-md text-xs transition-colors', historyFilter === job.id ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
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
                      {run.message && <p className="text-sm text-[var(--text-secondary)]">{run.message}</p>}
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

      {/* Event detail popup */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[#111118] border border-white/10 rounded-xl shadow-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-sm" style={{ background: selectedEvent.color }} />
              <h3 className="text-base font-semibold text-white">{selectedEvent.job.name}</h3>
            </div>
            {selectedEvent.job.description && (
              <p className="text-sm text-gray-400 mb-3">{selectedEvent.job.description}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-500 mb-0.5">Time (PKT)</div>
                <div className="text-white font-mono">{selectedEvent.hour.toString().padStart(2,'0')}:{selectedEvent.minute.toString().padStart(2,'0')}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-500 mb-0.5">Day</div>
                <div className="text-white">{DAY_LABELS[selectedEvent.day]}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-500 mb-0.5">Schedule</div>
                <div className="text-white font-mono text-[10px]">{selectedEvent.job.schedule}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-500 mb-0.5">Human</div>
                <div className="text-white">{selectedEvent.job.schedule_human || '—'}</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
