'use client'

import { useState } from 'react'
import {
  Shield, Eye, Search as SearchIcon, Bug, CheckCircle, AlertTriangle,
  ChevronDown, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Skill {
  id: string
  name: string
  version: string
  description: string
  status: 'active' | 'inactive' | 'error'
  lastRun: string | null
  author: string
  capabilities: string[]
  icon: React.ElementType
  color: string
}

interface ScanResult {
  id: string
  skill: string
  check: string
  status: 'pass' | 'fail' | 'warning'
  message: string
}

const skills: Skill[] = [
  {
    id: 'clawsec-suite',
    name: 'ClawSec Suite',
    version: '2.1.0',
    description: 'Comprehensive security toolkit for agent communication auditing, token rotation, and access control enforcement.',
    status: 'active',
    lastRun: '2026-03-23T14:00:00Z',
    author: 'OpenClaw Core',
    capabilities: ['token-rotation', 'access-audit', 'encryption-check', 'comm-monitoring'],
    icon: Shield,
    color: 'var(--accent-blue)',
  },
  {
    id: 'soul-guardian',
    name: 'Soul Guardian',
    version: '1.4.2',
    description: 'Behavioral guardrails and alignment monitoring. Ensures agents stay within defined operational boundaries.',
    status: 'active',
    lastRun: '2026-03-23T13:30:00Z',
    author: 'OpenClaw Core',
    capabilities: ['behavior-monitoring', 'boundary-enforcement', 'drift-detection', 'alert-escalation'],
    icon: Eye,
    color: 'var(--accent-purple)',
  },
  {
    id: 'openclaw-audit-watchdog',
    name: 'OpenClaw Audit Watchdog',
    version: '1.2.0',
    description: 'Continuous audit trail generation and compliance reporting for all agent actions and data access.',
    status: 'active',
    lastRun: '2026-03-23T06:00:00Z',
    author: 'OpenClaw Core',
    capabilities: ['audit-logging', 'compliance-report', 'data-access-tracking', 'anomaly-detection'],
    icon: Bug,
    color: 'var(--accent-orange)',
  },
  {
    id: 'searxng-local',
    name: 'SearXNG Local',
    version: '3.0.1',
    description: 'Privacy-preserving metasearch engine for agent web research. Routes through local SearXNG instance.',
    status: 'inactive',
    lastRun: '2026-03-22T16:45:00Z',
    author: 'Community',
    capabilities: ['web-search', 'privacy-routing', 'result-filtering', 'cache-management'],
    icon: SearchIcon,
    color: 'var(--accent-green)',
  },
]

const scanResults: ScanResult[] = [
  { id: '1', skill: 'clawsec-suite', check: 'Token Expiry', status: 'pass', message: 'All tokens valid and within rotation window' },
  { id: '2', skill: 'clawsec-suite', check: 'Access Control', status: 'pass', message: 'All agents within authorized permission scopes' },
  { id: '3', skill: 'clawsec-suite', check: 'Encryption', status: 'warning', message: 'ElevenLabs integration using expired credentials' },
  { id: '4', skill: 'soul-guardian', check: 'Behavioral Bounds', status: 'pass', message: 'No boundary violations detected in last 24h' },
  { id: '5', skill: 'soul-guardian', check: 'Alignment Drift', status: 'pass', message: 'All agents within acceptable drift thresholds' },
  { id: '6', skill: 'openclaw-audit-watchdog', check: 'Audit Completeness', status: 'pass', message: '100% of agent actions logged in last 24h' },
  { id: '7', skill: 'openclaw-audit-watchdog', check: 'PII Exposure', status: 'warning', message: 'whatsapp-cli agent handled 3 PII-containing messages' },
  { id: '8', skill: 'searxng-local', check: 'Service Health', status: 'fail', message: 'SearXNG instance not responding — service may be down' },
]

const statusConfig = {
  active: { label: 'Active', color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10', dot: 'bg-[var(--accent-green)]' },
  inactive: { label: 'Inactive', color: 'text-[var(--text-muted)]', bg: 'bg-white/5', dot: 'bg-[var(--text-muted)]' },
  error: { label: 'Error', color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10', dot: 'bg-[var(--accent-red)]' },
}

const checkStatusConfig = {
  pass: { icon: CheckCircle, color: 'text-[var(--accent-green)]' },
  fail: { icon: AlertTriangle, color: 'text-[var(--accent-red)]' },
  warning: { icon: AlertTriangle, color: 'text-[var(--accent-orange)]' },
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function SkillsPage() {
  const [expandedSkill, setExpandedSkill] = useState<string | null>('clawsec-suite')

  const passCount = scanResults.filter(r => r.status === 'pass').length
  const warnCount = scanResults.filter(r => r.status === 'warning').length
  const failCount = scanResults.filter(r => r.status === 'fail').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Skills</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Installed skill modules and security scans</p>
        </div>
      </div>

      {/* Scan Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-green)]/10 flex items-center justify-center">
            <CheckCircle size={18} className="text-[var(--accent-green)]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{passCount}</p>
            <p className="text-xs text-[var(--text-muted)]">Checks Passed</p>
          </div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-orange)]/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-[var(--accent-orange)]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{warnCount}</p>
            <p className="text-xs text-[var(--text-muted)]">Warnings</p>
          </div>
        </div>
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-red)]/10 flex items-center justify-center">
            <AlertTriangle size={18} className="text-[var(--accent-red)]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{failCount}</p>
            <p className="text-xs text-[var(--text-muted)]">Failures</p>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="space-y-3">
        {skills.map(skill => {
          const status = statusConfig[skill.status]
          const Icon = skill.icon
          const isExpanded = expandedSkill === skill.id
          const skillScans = scanResults.filter(r => r.skill === skill.id)

          return (
            <div key={skill.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${skill.color} 15%, transparent)` }}
                >
                  <Icon size={20} style={{ color: skill.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">{skill.name}</h3>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">v{skill.version}</span>
                    <div className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', status.bg, status.color)}>
                      <div className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                      {status.label}
                    </div>
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

                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <span>Author: <span className="text-[var(--text-secondary)]">{skill.author}</span></span>
                    <span>·</span>
                    <span>Capabilities:</span>
                    <div className="flex gap-1">
                      {skill.capabilities.map(cap => (
                        <span key={cap} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-[var(--text-secondary)]">{cap}</span>
                      ))}
                    </div>
                  </div>

                  {/* Scan Results */}
                  {skillScans.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-[var(--text-secondary)]">Latest Scan Results</p>
                      {skillScans.map(result => {
                        const checkConfig = checkStatusConfig[result.status]
                        const CheckIcon = checkConfig.icon
                        return (
                          <div key={result.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[var(--bg-secondary)]">
                            <CheckIcon size={14} className={checkConfig.color} />
                            <span className="text-xs text-[var(--text-primary)] w-36 shrink-0">{result.check}</span>
                            <span className="text-xs text-[var(--text-secondary)] flex-1">{result.message}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
