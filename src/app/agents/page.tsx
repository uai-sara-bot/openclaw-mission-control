'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface AgentData {
  id: string
  name: string
  role?: string
  model?: string
  status: 'working' | 'idle' | 'offline' | 'error' | 'active'
  current_task?: string
  last_seen?: string
  color?: string
  created_at?: string
}

interface ActivityEvent {
  id: string
  agent_name: string
  action: string
  event_type: string
  created_at: string
}

function getStatusColor(status: string) {
  if (status === 'working' || status === 'active') return '#22c55e'
  if (status === 'idle') return '#f59e0b'
  if (status === 'error') return '#ef4444'
  return '#6b7280'
}

function AgentCard({ agent, onClick }: { agent: AgentData; onClick: () => void }) {
  const color = agent.color || '#3b82f6'
  const statusColor = getStatusColor(agent.status)
  const isActive = agent.status === 'working' || agent.status === 'active'

  return (
    <div
      onClick={onClick}
      className="bg-[#111118] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 hover:shadow-lg hover:shadow-black/20 transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-base"
          style={{ backgroundColor: color }}
        >
          {agent.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{agent.name}</span>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }} />
            <span className="text-[10px] text-gray-500 capitalize">{agent.status}</span>
          </div>
          <div className="text-xs text-gray-400 truncate">{agent.role || 'Agent'}</div>
        </div>
      </div>

      <div className="space-y-1.5">
        {agent.model && (
          <div className="text-[10px] text-teal-400 font-medium truncate">{agent.model}</div>
        )}
        <p className="text-xs text-gray-500 line-clamp-2">
          {agent.current_task || (isActive ? 'Working...' : 'Standing by')}
        </p>
        {agent.last_seen && (
          <div className="text-[10px] text-gray-600">
            Last active: {new Date(agent.last_seen).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}

function AgentDetailModal({ agent, onClose }: { agent: AgentData; onClose: () => void }) {
  const color = agent.color || '#3b82f6'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#111118] border border-white/10 rounded-xl shadow-2xl">
        <div className="flex items-center gap-4 p-6 border-b border-white/10">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {agent.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusColor(agent.status) }} />
            </div>
            <div className="text-sm text-gray-400">{agent.role || 'Agent'}</div>
            {agent.model && <div className="text-xs text-teal-400 mt-0.5">{agent.model}</div>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Current Task</div>
            <div className="bg-white/5 rounded-lg p-3 text-sm text-gray-300">
              {agent.current_task || 'No active task'}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Status</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusColor(agent.status) }} />
              <span className="text-sm text-white capitalize">{agent.status}</span>
            </div>
          </div>

          {agent.last_seen && (
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Last Active</div>
              <div className="text-sm text-gray-400">{new Date(agent.last_seen).toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentData[]>([])
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [{ data: agentData, error: agentError }, { data: activityData }] = await Promise.all([
        supabase.from('agents').select('*').order('name'),
        supabase.from('activity_events').select('*').order('created_at', { ascending: false }).limit(20),
      ])
      if (agentError) console.error('Agents fetch error:', agentError)
      if (agentData) setAgents(agentData)
      if (activityData) setActivities(activityData)
      setLoading(false)
    }
    fetchData()

    const agentSub = supabase
      .channel('agents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, (payload) => {
        if (payload.eventType === 'INSERT') setAgents(prev => [...prev, payload.new as AgentData])
        if (payload.eventType === 'UPDATE') setAgents(prev => prev.map(a => a.id === (payload.new as AgentData).id ? payload.new as AgentData : a))
        if (payload.eventType === 'DELETE') setAgents(prev => prev.filter(a => a.id !== (payload.old as AgentData).id))
      })
      .subscribe()

    const activitySub = supabase
      .channel('agents-activity-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_events' }, (payload) => {
        setActivities(prev => [payload.new as ActivityEvent, ...prev.slice(0, 19)])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(agentSub)
      supabase.removeChannel(activitySub)
    }
  }, [])

  const working = agents.filter(a => a.status === 'working' || a.status === 'active').length
  const idle = agents.filter(a => a.status === 'idle').length
  const offline = agents.filter(a => a.status === 'offline').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-teal-400 animate-pulse">Loading agents...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm text-gray-400">{working} active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-sm text-gray-400">{idle} idle</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-500" />
          <span className="text-sm text-gray-400">{offline} offline</span>
        </div>
        <div className="ml-auto text-xs text-gray-500">Click a card for details</div>
      </div>

      {/* Agent Grid */}
      {agents.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
          <p className="text-gray-400 text-sm">No agents registered yet.</p>
          <p className="text-gray-600 text-xs mt-2">Agents will appear here when they connect to the gateway.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} onClick={() => setSelectedAgent(agent)} />
          ))}
        </div>
      )}

      {/* Recent Activity */}
      {activities.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            {activities.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-[#111118] border border-white/5 rounded-lg">
                <span className="text-xs font-semibold text-teal-400 shrink-0">{a.agent_name}</span>
                <span className="text-xs text-gray-400">{a.action}</span>
                <span className="ml-auto text-[10px] text-gray-600 shrink-0">{new Date(a.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAgent && <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
    </div>
  )
}
