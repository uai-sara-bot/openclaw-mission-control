'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AgentSlim {
  id: string
  name: string
  status: string
  current_task?: string | null
}

const AGENT_GROUPS = [
  {
    label: 'Core Operations',
    color: '#a855f7',
    agents: ['main', 'mission-control'],
    description: 'Primary assistants',
  },
  {
    label: 'Projects',
    color: '#3b82f6',
    agents: ['engage-dev', 'research', 'finance', 'general-work'],
    description: 'Project & work agents',
  },
  {
    label: 'Personal',
    color: '#22c55e',
    agents: ['personal', 'weather', 'sara-intimate', 'whatsapp-cli'],
    description: 'Personal assistants',
  },
  {
    label: 'AI Chat',
    color: '#f97316',
    agents: ['anthropic-chat', 'openai-chat', 'gemini-chat', 'qwen-chat', 'compare-llms'],
    description: 'Direct AI model access',
  },
]

function getGroupForAgent(agentId: string): (typeof AGENT_GROUPS)[0] | null {
  return AGENT_GROUPS.find(g => g.agents.includes(agentId)) || null
}

function AgentCard({ agent, groupColor }: { agent: AgentSlim; groupColor: string }) {
  const isWorking = agent.status === 'active'
  const initial = agent.name.charAt(0).toUpperCase()
  const shortName = agent.name.replace(/^Sara\s+/i, '').replace(/^ENGAGE\s+/i, 'ENG ')

  return (
    <div
      className="flex flex-col items-center gap-1 p-2 bg-[#111118] border border-white/10 rounded-xl hover:border-white/20 transition-colors cursor-default"
      title={`${agent.name}: ${agent.current_task || agent.status}`}
    >
      {/* Avatar */}
      <div className="relative">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: groupColor }}
        >
          {initial}
        </div>
        {/* Status dot */}
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111118] ${
            isWorking ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
          }`}
        />
      </div>
      {/* Name */}
      <span className="text-[10px] text-gray-300 font-medium text-center leading-tight max-w-[64px] truncate">
        {shortName}
      </span>
      {/* Current task if working */}
      {isWorking && agent.current_task && (
        <span
          className="text-[9px] text-gray-500 text-center leading-tight max-w-[72px] overflow-hidden"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}
        >
          {agent.current_task.slice(0, 40)}
        </span>
      )}
    </div>
  )
}

function ZonePanel({
  group,
  agents,
}: {
  group: (typeof AGENT_GROUPS)[0]
  agents: AgentSlim[]
}) {
  return (
    <div
      className="flex-1 min-w-[220px] rounded-xl p-3 border"
      style={{
        borderColor: group.color + '40',
        background: group.color + '08',
      }}
    >
      {/* Zone header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: group.color }} />
        <div>
          <div className="text-xs font-semibold" style={{ color: group.color }}>
            {group.label}
          </div>
          <div className="text-[10px] text-gray-500">{group.description}</div>
        </div>
        <div className="ml-auto text-[10px] text-gray-500">
          {agents.filter(a => a.status === 'active').length}/{agents.length} active
        </div>
      </div>

      {/* Agents grid: 2 columns */}
      {agents.length === 0 ? (
        <div className="text-[10px] text-gray-600 text-center py-4">No agents in this zone</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} groupColor={group.color} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function OfficePage() {
  const [agents, setAgents] = useState<AgentSlim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('agents')
      .select('id,name,status,current_task')
      .order('name')
      .then(({ data }) => {
        if (data) setAgents(data)
        setLoading(false)
      })

    const sub = supabase
      .channel('office-agents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        supabase
          .from('agents')
          .select('id,name,status,current_task')
          .order('name')
          .then(({ data }) => {
            if (data) setAgents(data)
          })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [])

  // Sort agents: working first
  const sortedAgents = [...agents].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1
    if (a.status !== 'active' && b.status === 'active') return 1
    return 0
  })

  // Group agents by zone
  const agentsByGroup = AGENT_GROUPS.map(group => ({
    group,
    agents: agents.filter(a => group.agents.includes(a.id)),
  }))

  // Ungrouped agents (not in any zone)
  const groupedIds = new Set(AGENT_GROUPS.flatMap(g => g.agents))
  const ungrouped = agents.filter(a => !groupedIds.has(a.id))

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Demo controls */}
      <div className="flex items-center gap-2 p-4 border-b border-white/10 flex-wrap">
        <span className="text-xs text-gray-500 mr-1">Office Controls</span>
        {['All Working', 'Gather', 'Run Meeting', 'Watercooler'].map(btn => (
          <button
            key={btn}
            onClick={() => alert(`${btn} triggered`)}
            className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 rounded text-xs transition-colors"
          >
            {btn}
          </button>
        ))}
        <button
          onClick={() => alert('Chat started')}
          className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-black rounded text-xs font-medium ml-2"
        >
          + Start Chat
        </button>
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
          <span>
            <span className="text-green-400 font-medium">{agents.filter(a => a.status === 'active').length}</span> working
          </span>
          <span>
            <span className="text-yellow-400 font-medium">{agents.filter(a => a.status !== 'active').length}</span> idle
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-teal-400">Loading...</div>
      ) : agents.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">No agents active</p>
            <p className="text-sm">Configure agents in OpenClaw to see them here.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          {/* 4-zone grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {agentsByGroup.map(({ group, agents: groupAgents }) => (
              <ZonePanel key={group.label} group={group} agents={groupAgents} />
            ))}
          </div>

          {/* Uncategorized agents */}
          {ungrouped.length > 0 && (
            <div className="rounded-xl p-3 border border-white/10 bg-white/3">
              <div className="text-xs font-semibold text-gray-400 mb-3">Other Agents</div>
              <div className="grid grid-cols-4 gap-2">
                {ungrouped.map(agent => (
                  <AgentCard key={agent.id} agent={agent} groupColor="#6b7280" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom status bar: sorted working first */}
      {agents.length > 0 && (
        <div className="flex gap-2 p-3 border-t border-white/10 overflow-x-auto">
          {sortedAgents.map(agent => (
            <div
              key={agent.id}
              className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/10 text-xs whitespace-nowrap"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${agent.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}
              />
              <span className="text-gray-300">{agent.name}</span>
              {agent.status === 'active' && agent.current_task && (
                <span className="text-gray-500 max-w-[100px] truncate">— {agent.current_task}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
