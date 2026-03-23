import { AgentCard } from '@/components/agents/AgentCard'
import { Agent } from '@/types'
import { Activity, DollarSign, Users, Zap } from 'lucide-react'

// Our 13 agents - will be fetched from Supabase later
const agents: Agent[] = [
  { id: '1', name: 'main', model: 'Claude Opus', status: 'active', role: 'Primary Assistant', channel: 'DM', last_seen: new Date().toISOString(), token_usage_today: 45230, created_at: '2026-03-08' },
  { id: '2', name: 'finance', model: 'Claude Sonnet', status: 'active', role: 'Finance Tracker', channel: '#finance', last_seen: new Date().toISOString(), token_usage_today: 3200, created_at: '2026-03-23' },
  { id: '3', name: 'engage-dev', model: 'Claude Sonnet', status: 'idle', role: 'ENGAGE Project', channel: '#engage-dev', last_seen: new Date().toISOString(), token_usage_today: 18500, created_at: '2026-03-21' },
  { id: '4', name: 'research', model: 'Claude Sonnet', status: 'idle', role: 'Research Agent', channel: '#research', last_seen: new Date().toISOString(), token_usage_today: 8900, created_at: '2026-03-21' },
  { id: '5', name: 'personal', model: 'Claude Sonnet', status: 'idle', role: 'Personal Topics', channel: '#personal', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '6', name: 'openai-chat', model: 'GPT-5.4', status: 'offline', role: 'OpenAI Testing', channel: '#openai-chat', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '7', name: 'gemini-chat', model: 'Gemini', status: 'offline', role: 'Gemini Testing', channel: '#gemini-chat', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '8', name: 'anthropic-chat', model: 'Claude', status: 'offline', role: 'Anthropic Testing', channel: '#anthropic-chat', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '9', name: 'compare-llms', model: 'Various', status: 'offline', role: 'Model Comparison', channel: '#compare-llms', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '10', name: 'general-work', model: 'Claude Sonnet', status: 'offline', role: 'General Tasks', channel: '#general-work', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '11', name: 'qwen-chat', model: 'Qwen', status: 'offline', role: 'Qwen Testing', channel: '#qwen-chat', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '12', name: 'sara-intimate', model: 'OpenRouter', status: 'offline', role: 'Intimate Chat', channel: '#late-night', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '13', name: 'whatsapp-cli', model: 'Claude Sonnet', status: 'offline', role: 'WhatsApp Interface', channel: 'WhatsApp', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
]

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

export default function Dashboard() {
  const activeAgents = agents.filter(a => a.status === 'active').length
  const totalTokens = agents.reduce((sum, a) => sum + a.token_usage_today, 0)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Agents" value={agents.length.toString()} icon={Users} color="text-[var(--accent-blue)]" />
        <StatCard label="Active Now" value={activeAgents.toString()} icon={Zap} color="text-[var(--accent-green)]" />
        <StatCard label="Tokens Today" value={totalTokens.toLocaleString()} icon={Activity} color="text-[var(--accent-purple)]" />
        <StatCard label="Est. Cost Today" value={`$${(totalTokens * 0.000015).toFixed(2)}`} icon={DollarSign} color="text-[var(--accent-orange)]" />
      </div>

      {/* Agents Grid */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Agent Fleet</h2>
        <div className="grid grid-cols-3 gap-4">
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  )
}
