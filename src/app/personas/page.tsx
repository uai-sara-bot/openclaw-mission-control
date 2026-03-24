'use client'

import { useState, useEffect, useMemo } from 'react'
import { Agent } from '@/types'
import { Search, Circle, Bot } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: 'var(--accent-green)', label: 'Active' },
  idle: { color: 'var(--accent-orange)', label: 'Idle' },
  offline: { color: 'var(--text-muted)', label: 'Offline' },
  error: { color: 'var(--accent-red)', label: 'Error' },
}

const statusFilters = ['All', 'Active', 'Idle', 'Offline'] as const

export default function PersonasPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')

  useEffect(() => {
    supabase.from('agents').select('*').order('name')
      .then(({ data }) => {
        if (data) setAgents(data)
        setLoading(false)
      })

    const sub = supabase.channel('personas-agents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, (payload) => {
        if (payload.eventType === 'INSERT') setAgents(prev => [...prev, payload.new as Agent].sort((a, b) => a.name.localeCompare(b.name)))
        if (payload.eventType === 'UPDATE') setAgents(prev => prev.map(a => a.id === payload.new.id ? payload.new as Agent : a))
        if (payload.eventType === 'DELETE') setAgents(prev => prev.filter(a => a.id !== (payload.old as Agent).id))
      }).subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const filtered = useMemo(() => {
    return agents.filter(a => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase()) ||
        a.model.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [agents, search, statusFilter])

  if (loading) return <div className="flex items-center justify-center h-64 text-teal-400">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Personas</h1>
        <span className="text-sm text-[var(--text-muted)]">{filtered.length} of {agents.length} agents</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by name, role, or model..."
            aria-label="Search personas"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
          />
        </div>

        <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border)]">
          {statusFilters.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === f
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg mb-2">No agents configured</p>
          <p className="text-sm">Add agents in OpenClaw config to see persona cards here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filtered.map(agent => {
            const sc = statusConfig[agent.status] ?? statusConfig.offline
            return (
              <div
                key={agent.id}
                className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5 hover:border-[var(--accent-blue)]/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-teal-300">{agent.name[0]}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{agent.name}</h3>
                      <p className="text-sm text-[var(--accent-purple)]">{agent.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Circle size={8} fill={sc.color} stroke={sc.color} />
                    <span className="text-xs" style={{ color: sc.color }}>{sc.label}</span>
                  </div>
                </div>

                {/* Current Task */}
                {(agent as Agent & { current_task?: string }).current_task && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <p className="text-xs text-[var(--text-muted)] mb-0.5">Current Task</p>
                    <p className="text-sm text-[var(--text-primary)] truncate">{(agent as Agent & { current_task?: string }).current_task}</p>
                  </div>
                )}

                {/* Agent Link */}
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                  <Bot size={14} />
                  <span className="font-mono">{agent.model}</span>
                  <span>·</span>
                  <span>{agent.channel}</span>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && agents.length > 0 && (
            <div className="col-span-full py-12 text-center text-[var(--text-muted)]">
              No agents match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
