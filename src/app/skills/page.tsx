'use client'

import { useState, useEffect } from 'react'
import {
  Shield, Eye, Search as SearchIcon, Bug, CheckCircle, AlertTriangle,
  ChevronDown, ChevronUp, Zap, Github, Cloud, Code, Globe
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Skill {
  id: string
  name: string
  version: string
  description: string
  status: 'active' | 'inactive' | 'error'
  lastRun: string | null
  source: string
  capabilities: string[]
  enabled: boolean
}

const ICON_MAP: Record<string, React.ElementType> = {
  'clawsec-suite': Shield,
  'soul-guardian': Eye,
  'openclaw-audit-watchdog': Bug,
  'searxng-local': SearchIcon,
  'acp-router': Zap,
  'one-drive': Cloud,
  'coding-agent': Code,
  'github': Github,
  'weather': Globe,
}

const COLOR_MAP: Record<string, string> = {
  'clawsec-suite': 'var(--accent-blue)',
  'soul-guardian': 'var(--accent-purple)',
  'openclaw-audit-watchdog': 'var(--accent-orange)',
  'searxng-local': 'var(--accent-green)',
  'acp-router': 'var(--accent-blue)',
  'one-drive': 'var(--accent-blue)',
  'coding-agent': 'var(--accent-green)',
  'github': 'var(--text-secondary)',
  'weather': 'var(--accent-blue)',
}

const statusConfig = {
  active: { label: 'Active', color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10', dot: 'bg-[var(--accent-green)]' },
  inactive: { label: 'Inactive', color: 'text-[var(--text-muted)]', bg: 'bg-white/5', dot: 'bg-[var(--text-muted)]' },
  error: { label: 'Error', color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10', dot: 'bg-[var(--accent-red)]' },
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSkill, setExpandedSkill] = useState<string | null>('clawsec-suite')

  useEffect(() => {
    fetch('/api/openclaw/skills')
      .then(r => r.json())
      .then((data: Skill[]) => {
        setSkills(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-teal-400">Loading...</div>

  const activeCount = skills.filter(s => s.status === 'active').length
  const inactiveCount = skills.filter(s => s.status === 'inactive').length
  const errorCount = skills.filter(s => s.status === 'error').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Skills</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Installed skill modules for this OpenClaw instance</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-green)]/10 flex items-center justify-center">
            <CheckCircle size={18} className="text-[var(--accent-green)]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{activeCount}</p>
            <p className="text-xs text-[var(--text-muted)]">Active Skills</p>
          </div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
            <AlertTriangle size={18} className="text-[var(--text-muted)]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{inactiveCount}</p>
            <p className="text-xs text-[var(--text-muted)]">Inactive</p>
          </div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-red)]/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-[var(--accent-red)]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{errorCount}</p>
            <p className="text-xs text-[var(--text-muted)]">Errors</p>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-3">
        {skills.map(skill => {
          const status = statusConfig[skill.status] ?? statusConfig.inactive
          const Icon = ICON_MAP[skill.id] ?? Shield
          const color = COLOR_MAP[skill.id] ?? 'var(--accent-blue)'
          const isExpanded = expandedSkill === skill.id

          return (
            <div key={skill.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">{skill.name}</h3>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">v{skill.version}</span>
                    <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', status.bg, status.color)}>
                      <div className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                      {status.label}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">{skill.source}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{skill.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {skill.lastRun && (
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{formatTime(skill.lastRun)}</span>
                  )}
                  {isExpanded ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-4">
                  <div className="border-t border-[var(--border)] pt-4" />
                  <div className="flex items-start gap-4 text-xs text-[var(--text-muted)]">
                    <span>Source: <span className="text-[var(--text-secondary)]">{skill.source}</span></span>
                    <span>·</span>
                    <span className="flex-1">
                      Capabilities:
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skill.capabilities.map(cap => (
                          <span key={cap} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-[var(--text-secondary)]">{cap}</span>
                        ))}
                      </div>
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{skill.description}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
