'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────
interface AgentData {
  name: string
  role: string
  model: string
  status: 'working' | 'idle'
  task: string
  lastActive: string
  color: string
}

// ── Mock Data ──────────────────────────────────────────────
const agents: AgentData[] = [
  { name: 'Henry', role: 'Chief of Staff', model: 'Claude Opus 4.5', status: 'working', task: 'Coordinating weekly ops review', lastActive: '2m ago', color: '#a855f7' },
  { name: 'Charlie', role: 'Infrastructure Engineer', model: 'GPT-5.2 Codex', status: 'working', task: 'SpacetimeDB server module', lastActive: '1m ago', color: '#3b82f6' },
  { name: 'Ralph', role: 'QA Automation Lead', model: 'Claude Sonnet 4.5', status: 'working', task: 'Triaging flaky tests', lastActive: '3m ago', color: '#f97316' },
  { name: 'Scout', role: 'Trend Analyst', model: 'GLM-4.7 Local', status: 'working', task: 'Mapping competitor releases', lastActive: '5m ago', color: '#22c55e' },
  { name: 'Quill', role: 'Content Writer', model: 'Claude Opus 4.5', status: 'working', task: 'Drafting video script', lastActive: '4m ago', color: '#ec4899' },
  { name: 'Pixel', role: 'Thumbnail Designer', model: 'Flux2 + LoRA', status: 'idle', task: 'Standing by', lastActive: '15m ago', color: '#f59e0b' },
  { name: 'Echo', role: 'Social Media Manager', model: 'Claude Opus 4.5', status: 'working', task: 'Calibrating post timing', lastActive: '6m ago', color: '#06b6d4' },
  { name: 'Codex', role: 'Lead Engineer', model: 'GPT-5.2 Codex', status: 'working', task: 'Refactoring auth middleware', lastActive: '2m ago', color: '#8b5cf6' },
]

// ── Agent Card ─────────────────────────────────────────────
function AgentCard({ agent, onClick }: { agent: AgentData; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#111118] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 hover:shadow-lg hover:shadow-black/20 transition-all"
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-base"
          style={{ backgroundColor: agent.color }}
        >
          {agent.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{agent.name}</span>
            {/* Status dot */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: agent.status === 'working' ? '#22c55e' : '#f59e0b' }}
            />
            <span className="text-[10px] text-gray-500 capitalize">{agent.status}</span>
          </div>
          <div className="text-xs text-gray-400 truncate">{agent.role}</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-teal-400 font-medium truncate">{agent.model}</span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-2">{agent.task}</p>
        <div className="text-[10px] text-gray-600">Last active: {agent.lastActive}</div>
      </div>
    </div>
  )
}

// ── Agent Detail Modal ─────────────────────────────────────
function AgentDetailModal({ agent, onClose }: { agent: AgentData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#111118] border border-white/10 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-white/10">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: agent.color }}
          >
            {agent.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: agent.status === 'working' ? '#22c55e' : '#f59e0b' }}
              />
            </div>
            <div className="text-sm text-gray-400">{agent.role}</div>
            <div className="text-xs text-teal-400 mt-0.5">{agent.model}</div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current Task */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Current Task</div>
            <div className="bg-white/5 rounded-lg p-3 text-sm text-gray-300">{agent.task}</div>
          </div>

          {/* Instructions */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Instructions</div>
            <div className="bg-white/5 rounded-lg p-3 text-sm text-gray-400 leading-relaxed">
              You are {agent.name}, a {agent.role} working within the OpenClaw multi-agent system.
              Your job is to proactively complete tasks, coordinate with other agents, and report
              progress clearly. Always escalate blockers immediately and keep your task queue updated.
            </div>
          </div>

          {/* Objectives */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Objectives</div>
            <div className="space-y-2">
              {[
                'Complete all assigned tasks within deadline',
                'Maintain clear communication with the ops team',
                'Flag blockers and escalate within 15 minutes',
              ].map((obj, i) => (
                <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded accent-teal-500" />
                  <span className="text-sm text-gray-400">{obj}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Hard Rules */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Hard Rules</div>
            <div className="bg-red-950/40 border border-red-900/30 rounded-lg p-3 space-y-1.5">
              {[
                'Never share credentials or API keys in plaintext',
                'Do not access systems outside assigned scope',
                'Always confirm destructive actions before executing',
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-300">
                  <span className="text-red-500 flex-shrink-0 mt-0.5">•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Escalation */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Escalation</div>
            <div className="bg-white/5 rounded-lg p-3 text-sm text-gray-400">
              Escalate to Henry (Chief of Staff) for cross-agent coordination issues.
              Escalate to Awais directly for budget decisions or external API access requests.
              Use the <span className="text-teal-400">#escalations</span> Slack channel.
            </div>
          </div>

          {/* Metrics */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Metrics</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Tasks today', value: '12' },
                { label: 'Avg response', value: '1.4s' },
                { label: 'Token usage', value: '42K' },
              ].map(m => (
                <div key={m.label} className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">{m.value}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────
export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null)

  const working = agents.filter(a => a.status === 'working').length
  const idle = agents.filter(a => a.status === 'idle').length

  return (
    <div className="p-6">
      {/* Header stats */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm text-gray-400">{working} working</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-sm text-gray-400">{idle} idle</span>
        </div>
        <div className="ml-auto text-xs text-gray-500">Click a card for details</div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map(agent => (
          <AgentCard key={agent.name} agent={agent} onClick={() => setSelectedAgent(agent)} />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  )
}
