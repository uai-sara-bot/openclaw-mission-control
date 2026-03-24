'use client'

import { useState } from 'react'
import { Pause, Zap, RefreshCw, Server } from 'lucide-react'

interface Agent {
  id: string
  name: string
  role: string
  model: string
  tags: string[]
  machine: string
  gradient: string
}

const agents: Agent[] = [
  { id: 'henry', name: 'Henry', role: 'Chief of Staff', model: 'claude-sonnet-4', tags: ['orchestration', 'planning', 'strategy'], machine: 'Machine 1', gradient: 'from-teal-500/20 to-cyan-500/20 border-teal-500/40' },
  { id: 'charlie', name: 'Charlie', role: 'Infrastructure Lead', model: 'claude-sonnet-4', tags: ['infra', 'devops', 'systems'], machine: 'Machine 1', gradient: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40' },
  { id: 'ralph', name: 'Ralph', role: 'QA Foreman', model: 'claude-sonnet-4', tags: ['testing', 'QA', 'oversight'], machine: 'Machine 2', gradient: 'from-orange-500/20 to-amber-500/20 border-orange-500/40' },
  { id: 'scout', name: 'Scout', role: 'Trend Analyst', model: 'gpt-4o', tags: ['research', 'trends', 'signals'], machine: 'Machine 2', gradient: 'from-green-500/20 to-emerald-500/20 border-green-500/40' },
  { id: 'echo', name: 'Echo', role: 'Social Media', model: 'gpt-4o', tags: ['twitter', 'linkedin', 'social'], machine: 'Machine 2', gradient: 'from-pink-500/20 to-rose-500/20 border-pink-500/40' },
  { id: 'quill', name: 'Quill', role: 'Content Writer', model: 'claude-sonnet-4', tags: ['writing', 'newsletter', 'copy'], machine: 'Machine 1', gradient: 'from-purple-500/20 to-violet-500/20 border-purple-500/40' },
  { id: 'pixel', name: 'Pixel', role: 'Thumbnail Designer', model: 'dall-e-3', tags: ['design', 'thumbnails', 'visual'], machine: 'Machine 3', gradient: 'from-yellow-500/20 to-lime-500/20 border-yellow-500/40' },
  { id: 'codex', name: 'Codex', role: 'Lead Engineer', model: 'claude-sonnet-4', tags: ['coding', 'PRs', 'engineering'], machine: 'Machine 3', gradient: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/40' },
]

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className={`rounded-xl p-4 border bg-gradient-to-br ${agent.gradient}`} style={{ minWidth: '180px' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-base font-bold text-white">{agent.name[0]}</span>
        </div>
        <div className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-black/20 text-white/50">
          <Server size={9} />
          <span>{agent.machine}</span>
        </div>
      </div>
      <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{agent.role}</p>
      <p className="text-xs mb-3 font-mono opacity-60 text-white">{agent.model}</p>
      <div className="flex flex-wrap gap-1">
        {agent.tags.map(tag => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function TeamPage() {
  const [pinged, setPinged] = useState(false)
  const [paused, setPaused] = useState(false)

  const henry = agents.find(a => a.id === 'henry')!
  const ops = agents.filter(a => ['charlie', 'ralph'].includes(a.id))
  const input = agents.filter(a => ['scout', 'echo'].includes(a.id))
  const output = agents.filter(a => ['quill', 'pixel'].includes(a.id))
  const meta = agents.filter(a => ['codex'].includes(a.id))

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Agent org chart</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              paused ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'border-white/10 hover:border-white/20 text-white/70'
            }`}
          >
            <Pause size={13} />
            {paused ? 'Paused' : 'Pause All'}
          </button>
          <button
            onClick={() => { setPinged(true); setTimeout(() => setPinged(false), 2000) }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-teal-500/40 bg-teal-500/10 text-teal-300 text-sm font-medium hover:bg-teal-500/20 transition-colors"
          >
            <Zap size={13} />
            {pinged ? 'Pinged!' : 'Ping Henry'}
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white/70 text-sm font-medium hover:border-white/20 transition-colors"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="mb-8 p-6 rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-500/10 to-cyan-500/10">
        <p className="text-lg font-semibold text-white text-center leading-relaxed mb-2">
          &ldquo;An autonomous organization of AI agents that does work for me and produces value 24/7&rdquo;
        </p>
        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          9 AI agents across 3 machines, each with a real role and a real personality
        </p>
      </div>

      {/* Org Chart */}
      <div className="space-y-8">
        {/* Row 1 — Operations */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-center mb-4" style={{ color: 'var(--text-muted)' }}>OPERATIONS</p>
          <div className="flex justify-center">
            <AgentCard agent={henry} />
          </div>
        </div>

        {/* Connector */}
        <div className="flex justify-center">
          <div className="w-px h-6 bg-white/10" />
        </div>

        {/* Row 2 — Ops team */}
        <div>
          <div className="flex justify-center gap-4">
            {ops.map(a => <AgentCard key={a.id} agent={a} />)}
          </div>
        </div>

        {/* Row 3 — Input + Output */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-center mb-4" style={{ color: 'var(--text-muted)' }}>INPUT SIGNALS</p>
            <div className="flex justify-center gap-3">
              {input.map(a => <AgentCard key={a.id} agent={a} />)}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-center mb-4" style={{ color: 'var(--text-muted)' }}>OUTPUT ACTIONS</p>
            <div className="flex justify-center gap-3">
              {output.map(a => <AgentCard key={a.id} agent={a} />)}
            </div>
          </div>
        </div>

        {/* Row 4 — Meta */}
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-center mb-4" style={{ color: 'var(--text-muted)' }}>META LAYER</p>
          <div className="flex justify-center">
            {meta.map(a => <AgentCard key={a.id} agent={a} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
