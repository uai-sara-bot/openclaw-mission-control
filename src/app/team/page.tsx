'use client'

import { useState, useEffect } from 'react'
import { Pause, Zap, RefreshCw, Server } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Agent } from '@/types'

const GRADIENTS = [
  'from-teal-500/20 to-cyan-500/20 border-teal-500/40',
  'from-blue-500/20 to-indigo-500/20 border-blue-500/40',
  'from-orange-500/20 to-amber-500/20 border-orange-500/40',
  'from-green-500/20 to-emerald-500/20 border-green-500/40',
  'from-pink-500/20 to-rose-500/20 border-pink-500/40',
  'from-purple-500/20 to-violet-500/20 border-purple-500/40',
  'from-yellow-500/20 to-lime-500/20 border-yellow-500/40',
  'from-cyan-500/20 to-sky-500/20 border-cyan-500/40',
]

function hashGradient(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff
  return GRADIENTS[Math.abs(h) % GRADIENTS.length]
}

function AgentCard({ agent, gradient }: { agent: Agent; gradient: string }) {
  return (
    <div className={`rounded-xl p-4 border bg-gradient-to-br ${gradient}`} style={{ minWidth: '180px' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <span className="text-base font-bold text-white">{agent.name[0]}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${
          agent.status === 'active' ? 'bg-green-500/20 text-green-300' :
          agent.status === 'idle' ? 'bg-yellow-500/20 text-yellow-300' :
          'bg-white/10 text-white/50'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            agent.status === 'active' ? 'bg-green-400' :
            agent.status === 'idle' ? 'bg-yellow-400' : 'bg-white/40'
          }`} />
          <span>{agent.status}</span>
        </div>
      </div>
      <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{agent.role}</p>
      <p className="text-xs mb-3 font-mono opacity-60 text-white">{agent.model}</p>
      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Server size={10} />
        <span>{agent.channel}</span>
      </div>
    </div>
  )
}

export default function TeamPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [pinged, setPinged] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    supabase.from('agents').select('*').order('name')
      .then(({ data }) => {
        if (data) setAgents(data)
        setLoading(false)
      })

    const sub = supabase.channel('team-agents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, (payload) => {
        if (payload.eventType === 'INSERT') setAgents(prev => [...prev, payload.new as Agent].sort((a, b) => a.name.localeCompare(b.name)))
        if (payload.eventType === 'UPDATE') setAgents(prev => prev.map(a => a.id === payload.new.id ? payload.new as Agent : a))
        if (payload.eventType === 'DELETE') setAgents(prev => prev.filter(a => a.id !== (payload.old as Agent).id))
      }).subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-teal-400">Loading...</div>

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Agent org chart · {agents.length} agents</p>
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
          {agents.length} AI agents, each with a real role and a real purpose
        </p>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <p className="text-lg mb-2">No agents configured</p>
          <p className="text-sm">Add agents via the OpenClaw config to see them here.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} gradient={hashGradient(agent.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
