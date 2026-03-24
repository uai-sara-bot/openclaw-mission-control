'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Activity, DollarSign, Users, Zap, TrendingUp } from 'lucide-react'

interface AgentRow {
  id: string
  name: string
  status: string
  role?: string
  model?: string
  color?: string
  last_seen?: string
  current_task?: string
}

interface ActivityEvent {
  id: string
  agent_name: string
  action?: string
  content?: string
  event_type?: string
  created_at: string
}

interface TaskStats {
  total: number
  inprogress: number
  done_today: number
  review: number
}

interface CostTotal {
  total: number
  token_total: number
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
        <Icon size={16} className={color} />
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}

function getStatusColor(status: string) {
  if (status === 'active' || status === 'working') return '#22c55e'
  if (status === 'idle') return '#f59e0b'
  return '#6b7280'
}

function AgentMiniCard({ agent }: { agent: AgentRow }) {
  const color = agent.color || '#3b82f6'
  const statusColor = getStatusColor(agent.status)
  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 hover:border-white/20 transition-all">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: color }}>
          {agent.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white truncate">{agent.name}</span>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }} />
          </div>
          <div className="text-xs text-gray-500 truncate">{agent.role || 'Agent'}</div>
        </div>
      </div>
      {agent.model && <div className="text-[10px] text-teal-400 truncate">{agent.model}</div>}
      {agent.current_task && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{agent.current_task}</p>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [agents, setAgents] = useState<AgentRow[]>([])
  const [taskStats, setTaskStats] = useState<TaskStats>({ total: 0, inprogress: 0, done_today: 0, review: 0 })
  const [costTotal, setCostTotal] = useState<CostTotal>({ total: 0, token_total: 0 })
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const today = new Date().toISOString().split('T')[0]
      const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [
        { data: agentData },
        { data: taskData },
        { data: costData },
        { data: activityData },
      ] = await Promise.all([
        supabase.from('agents').select('*').order('name'),
        supabase.from('tasks').select('status, completed_at'),
        supabase.from('costs').select('cost, input_tokens, output_tokens').gte('created_at', since30d),
        supabase.from('activity_events').select('*').order('created_at', { ascending: false }).limit(10),
      ])

      if (agentData) setAgents(agentData)

      if (taskData) {
        const stats = {
          total: taskData.length,
          inprogress: taskData.filter(t => t.status === 'inprogress').length,
          done_today: taskData.filter(t => t.status === 'done' && t.completed_at?.startsWith(today)).length,
          review: taskData.filter(t => t.status === 'review').length,
        }
        setTaskStats(stats)
      }

      if (costData) {
        setCostTotal({
          total: costData.reduce((s, r) => s + (r.cost || 0), 0),
          token_total: costData.reduce((s, r) => s + (r.input_tokens || 0) + (r.output_tokens || 0), 0),
        })
      }

      if (activityData) setActivities(activityData)
      setLoading(false)
    }
    fetchData()

    // Real-time subs
    const agentSub = supabase
      .channel('dashboard-agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        supabase.from('agents').select('*').order('name').then(({ data }) => { if (data) setAgents(data) })
      })
      .subscribe()

    const activitySub = supabase
      .channel('dashboard-activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_events' }, (payload) => {
        setActivities(prev => [payload.new as ActivityEvent, ...prev.slice(0, 9)])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(agentSub)
      supabase.removeChannel(activitySub)
    }
  }, [])

  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'working').length

  function formatTokens(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${Math.round(n / 1_000)}K`
    return n.toString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-teal-400 animate-pulse">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Agents"
          value={agents.length > 0 ? agents.length.toString() : '—'}
          icon={Users}
          color="text-[var(--accent-blue)]"
        />
        <StatCard
          label="Active Now"
          value={activeAgents.toString()}
          icon={Zap}
          color="text-[var(--accent-green)]"
        />
        <StatCard
          label="Tasks In Progress"
          value={taskStats.inprogress.toString()}
          icon={Activity}
          color="text-[var(--accent-purple)]"
        />
        <StatCard
          label="Cost (30d)"
          value={costTotal.total > 0 ? `$${costTotal.total.toFixed(2)}` : '—'}
          icon={DollarSign}
          color="text-[var(--accent-orange)]"
        />
      </div>

      {/* Agents Grid */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Agent Fleet</h2>
        {agents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <Users size={32} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-400 text-sm">No agents registered yet.</p>
            <p className="text-gray-600 text-xs mt-2">Agents will appear here when they connect to OpenClaw.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map(agent => (
              <AgentMiniCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          Recent Activity
        </h2>
        {activities.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
            <p className="text-gray-500 text-sm">No recent activity — start using OpenClaw to see live updates.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg hover:border-white/20 transition-colors">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] text-teal-400 font-bold">{a.agent_name[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-teal-400">{a.agent_name}</span>
                  <span className="text-xs text-gray-400 ml-2">{a.action || a.content}</span>
                </div>
                <span className="text-[10px] text-gray-600 shrink-0">{new Date(a.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
