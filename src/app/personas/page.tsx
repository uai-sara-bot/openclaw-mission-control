'use client'

import { useState, useMemo } from 'react'
import { Persona } from '@/types'
import { Search, Circle, Bot } from 'lucide-react'

const personas: Persona[] = [
  {
    id: '1', name: 'sara', displayName: 'Sara', avatar: '👩‍💼', role: 'Project Manager',
    skills: ['Planning', 'Coordination', 'Reporting', 'Agile'],
    description: 'Oversees project timelines, coordinates between agents, and ensures deliverables stay on track.',
    status: 'active', currentTask: 'Sprint planning for v2.0 release',
    agentId: '1', model: 'Claude Opus', channel: 'DM',
  },
  {
    id: '2', name: 'atlas', displayName: 'Atlas', avatar: '🎨', role: 'Frontend Developer',
    skills: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
    description: 'Builds and maintains the Mission Control UI, component library, and frontend architecture.',
    status: 'active', currentTask: 'Building persona cards component',
    agentId: '3', model: 'Claude Sonnet', channel: '#engage-dev',
  },
  {
    id: '3', name: 'nova', displayName: 'Nova', avatar: '⚙️', role: 'Backend Developer',
    skills: ['Node.js', 'PostgreSQL', 'Supabase', 'WebSocket'],
    description: 'Designs APIs, manages database schemas, and handles real-time gateway connections.',
    status: 'active', currentTask: 'Optimizing WebSocket message throughput',
    agentId: '10', model: 'Claude Sonnet', channel: '#general-work',
  },
  {
    id: '4', name: 'echo', displayName: 'Echo', avatar: '🧪', role: 'QA Engineer',
    skills: ['Testing', 'Playwright', 'CI/CD', 'Bug Triage'],
    description: 'Writes and runs automated tests, triages bugs, and validates releases before deployment.',
    status: 'idle', currentTask: null,
    agentId: '4', model: 'Claude Sonnet', channel: '#research',
  },
  {
    id: '5', name: 'forge', displayName: 'Forge', avatar: '🔧', role: 'DevOps',
    skills: ['Docker', 'Railway', 'GitHub Actions', 'Monitoring'],
    description: 'Manages infrastructure, CI/CD pipelines, deployments, and system monitoring.',
    status: 'idle', currentTask: null,
    agentId: '10', model: 'Claude Sonnet', channel: '#general-work',
  },
  {
    id: '6', name: 'scout', displayName: 'Scout', avatar: '🔍', role: 'Researcher',
    skills: ['Analysis', 'Web Search', 'Summarization', 'Benchmarking'],
    description: 'Conducts deep research on technologies, competitors, and best practices.',
    status: 'active', currentTask: 'Researching agent orchestration frameworks',
    agentId: '4', model: 'Claude Sonnet', channel: '#research',
  },
  {
    id: '7', name: 'cipher', displayName: 'Cipher', avatar: '🛡️', role: 'Security Engineer',
    skills: ['Auth', 'OWASP', 'Encryption', 'Audit'],
    description: 'Reviews code for security vulnerabilities, manages auth flows, and conducts security audits.',
    status: 'offline', currentTask: null,
    agentId: '1', model: 'Claude Opus', channel: 'DM',
  },
  {
    id: '8', name: 'sage', displayName: 'Sage', avatar: '📚', role: 'Technical Writer',
    skills: ['Documentation', 'API Docs', 'Markdown', 'Tutorials'],
    description: 'Writes and maintains technical documentation, API references, and onboarding guides.',
    status: 'offline', currentTask: null,
    agentId: '10', model: 'Claude Sonnet', channel: '#general-work',
  },
]

const roles = ['All', ...Array.from(new Set(personas.map(p => p.role)))] as const
const statusFilters = ['All', 'Active', 'Idle', 'Offline'] as const

const statusConfig: Record<Persona['status'], { color: string; label: string }> = {
  active: { color: 'var(--accent-green)', label: 'Active' },
  idle: { color: 'var(--accent-orange)', label: 'Idle' },
  offline: { color: 'var(--text-muted)', label: 'Offline' },
}

export default function PersonasPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [roleFilter, setRoleFilter] = useState<string>('All')

  const filtered = useMemo(() => {
    return personas.filter(p => {
      const matchesSearch =
        p.displayName.toLowerCase().includes(search.toLowerCase()) ||
        p.role.toLowerCase().includes(search.toLowerCase()) ||
        p.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter.toLowerCase()
      const matchesRole = roleFilter === 'All' || p.role === roleFilter
      return matchesSearch && matchesStatus && matchesRole
    })
  }, [search, statusFilter, roleFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Personas</h1>
        <span className="text-sm text-[var(--text-muted)]">{filtered.length} of {personas.length} personas</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by name, role, or skill..."
            aria-label="Search personas"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
          />
        </div>

        {/* Status Filters */}
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

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          aria-label="Filter by role"
          className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
        >
          {roles.map(r => (
            <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>
          ))}
        </select>
      </div>

      {/* Persona Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map(persona => {
          const sc = statusConfig[persona.status]
          return (
            <div
              key={persona.id}
              className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5 hover:border-[var(--accent-blue)]/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label={persona.displayName}>{persona.avatar}</span>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{persona.displayName}</h3>
                    <p className="text-sm text-[var(--accent-purple)]">{persona.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Circle size={8} fill={sc.color} stroke={sc.color} />
                  <span className="text-xs" style={{ color: sc.color }}>{sc.label}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{persona.description}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {persona.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] border border-[var(--accent-blue)]/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Current Task */}
              {persona.currentTask && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">Current Task</p>
                  <p className="text-sm text-[var(--text-primary)] truncate">{persona.currentTask}</p>
                </div>
              )}

              {/* Agent Link */}
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
                <Bot size={14} />
                <span className="font-mono">{persona.model}</span>
                <span>·</span>
                <span>{persona.channel}</span>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-[var(--text-muted)]">
            No personas match your filters.
          </div>
        )}
      </div>
    </div>
  )
}
