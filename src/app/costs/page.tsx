'use client'

import { useSyncExternalStore } from 'react'
import { Metric } from '@/types'
import { DollarSign, Zap, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// --- Sample Data ---

const metrics: (Metric & { agent_name: string })[] = [
  { id: '1', agent_id: 'main', agent_name: 'main', model: 'Claude Opus', input_tokens: 1_245_000, output_tokens: 412_000, cost: 42.15, timestamp: '2026-03-23T08:00:00Z' },
  { id: '2', agent_id: 'personal', agent_name: 'personal', model: 'Claude Sonnet', input_tokens: 890_000, output_tokens: 305_000, cost: 14.33, timestamp: '2026-03-23T07:00:00Z' },
  { id: '3', agent_id: 'finance', agent_name: 'finance', model: 'Claude Sonnet', input_tokens: 342_000, output_tokens: 128_000, cost: 5.64, timestamp: '2026-03-23T06:00:00Z' },
  { id: '4', agent_id: 'engage-dev', agent_name: 'engage-dev', model: 'Claude Sonnet', input_tokens: 1_102_000, output_tokens: 387_000, cost: 17.87, timestamp: '2026-03-22T22:00:00Z' },
  { id: '5', agent_id: 'research', agent_name: 'research', model: 'Claude Sonnet', input_tokens: 675_000, output_tokens: 198_000, cost: 10.48, timestamp: '2026-03-22T20:00:00Z' },
  { id: '6', agent_id: 'openai-chat', agent_name: 'openai-chat', model: 'GPT-5.4', input_tokens: 520_000, output_tokens: 210_000, cost: 18.25, timestamp: '2026-03-22T18:00:00Z' },
  { id: '7', agent_id: 'gemini-chat', agent_name: 'gemini-chat', model: 'Gemini', input_tokens: 410_000, output_tokens: 155_000, cost: 4.52, timestamp: '2026-03-22T16:00:00Z' },
  { id: '8', agent_id: 'compare-llms', agent_name: 'compare-llms', model: 'Various', input_tokens: 980_000, output_tokens: 420_000, cost: 28.90, timestamp: '2026-03-22T14:00:00Z' },
  { id: '9', agent_id: 'general-work', agent_name: 'general-work', model: 'Claude Sonnet', input_tokens: 230_000, output_tokens: 85_000, cost: 3.78, timestamp: '2026-03-22T12:00:00Z' },
  { id: '10', agent_id: 'qwen-chat', agent_name: 'qwen-chat', model: 'Qwen', input_tokens: 185_000, output_tokens: 72_000, cost: 1.54, timestamp: '2026-03-23T05:00:00Z' },
  { id: '11', agent_id: 'sara-intimate', agent_name: 'sara-intimate', model: 'OpenRouter', input_tokens: 310_000, output_tokens: 145_000, cost: 6.82, timestamp: '2026-03-22T10:00:00Z' },
  { id: '12', agent_id: 'whatsapp-cli', agent_name: 'whatsapp-cli', model: 'Claude Sonnet', input_tokens: 120_000, output_tokens: 48_000, cost: 2.02, timestamp: '2026-03-23T04:00:00Z' },
  { id: '13', agent_id: 'anthropic-chat', agent_name: 'anthropic-chat', model: 'Claude', input_tokens: 445_000, output_tokens: 162_000, cost: 7.28, timestamp: '2026-03-22T08:00:00Z' },
]

const dailyUsage = [
  { date: 'Mar 17', input: 1_820_000, output: 620_000, cost: 38.20 },
  { date: 'Mar 18', input: 2_140_000, output: 780_000, cost: 45.60 },
  { date: 'Mar 19', input: 2_560_000, output: 910_000, cost: 52.80 },
  { date: 'Mar 20', input: 1_950_000, output: 720_000, cost: 41.30 },
  { date: 'Mar 21', input: 3_100_000, output: 1_120_000, cost: 68.40 },
  { date: 'Mar 22', input: 3_420_000, output: 1_280_000, cost: 78.50 },
  { date: 'Mar 23', input: 2_890_000, output: 980_000, cost: 63.58 },
]

// --- Helpers ---

const totalCost = metrics.reduce((sum, m) => sum + m.cost, 0)
const totalTokens = metrics.reduce((sum, m) => sum + m.input_tokens + m.output_tokens, 0)
const avgCostPerRequest = totalCost / metrics.length

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`
}

// --- Custom Tooltip ---

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 shadow-xl">
      <p className="text-xs font-medium text-[var(--text-primary)] mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-[var(--text-secondary)]">{entry.name}</span>
          </span>
          <span className="font-mono text-[var(--text-primary)]">
            {entry.name === 'Cost' ? formatCost(entry.value) : formatTokens(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// --- Page ---

export default function CostsPage() {
  const sortedAgents = [...metrics].sort((a, b) => b.cost - a.cost)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Cost Tracker</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Token usage and costs across all agents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-secondary)]">Total Cost (7d)</span>
            <span className="p-2 rounded-lg bg-[var(--accent-green)]/10">
              <DollarSign size={16} className="text-[var(--accent-green)]" />
            </span>
          </div>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono">{formatCost(totalCost)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <ArrowUp size={12} className="text-[var(--accent-red)]" />
            <span className="text-[var(--accent-red)]">12.3%</span>
            <span className="text-[var(--text-muted)]">vs last week</span>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-secondary)]">Total Tokens (7d)</span>
            <span className="p-2 rounded-lg bg-[var(--accent-blue)]/10">
              <Zap size={16} className="text-[var(--accent-blue)]" />
            </span>
          </div>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono">{formatTokens(totalTokens)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <ArrowDown size={12} className="text-[var(--accent-green)]" />
            <span className="text-[var(--accent-green)]">4.1%</span>
            <span className="text-[var(--text-muted)]">vs last week</span>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-secondary)]">Avg Cost / Request</span>
            <span className="p-2 rounded-lg bg-[var(--accent-purple)]/10">
              <TrendingUp size={16} className="text-[var(--accent-purple)]" />
            </span>
          </div>
          <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono">{formatCost(avgCostPerRequest)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <ArrowDown size={12} className="text-[var(--accent-green)]" />
            <span className="text-[var(--accent-green)]">2.7%</span>
            <span className="text-[var(--text-muted)]">vs last week</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
        <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">Token Usage — Last 7 Days</h2>
        <div className="h-72">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyUsage} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatTokens}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
                />
                <Line
                  type="monotone"
                  dataKey="input"
                  name="Input Tokens"
                  stroke="var(--accent-blue)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent-blue)', r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="output"
                  name="Output Tokens"
                  stroke="var(--accent-purple)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent-purple)', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
              Loading chart...
            </div>
          )}
        </div>
      </div>

      {/* Agent Cost Breakdown Table */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border)]">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Per-Agent Cost Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th scope="col" className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Agent</th>
                <th scope="col" className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Model</th>
                <th scope="col" className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Input Tokens</th>
                <th scope="col" className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Output Tokens</th>
                <th scope="col" className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Total Tokens</th>
                <th scope="col" className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {sortedAgents.map((agent) => {
                const totalAgentTokens = agent.input_tokens + agent.output_tokens
                const costPercent = (agent.cost / totalCost) * 100
                return (
                  <tr
                    key={agent.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="font-medium text-[var(--text-primary)] font-mono">{agent.agent_name}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/5 text-[var(--text-secondary)]">
                        {agent.model}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[var(--text-secondary)]">
                      {formatTokens(agent.input_tokens)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[var(--text-secondary)]">
                      {formatTokens(agent.output_tokens)}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[var(--text-primary)]">
                      {formatTokens(totalAgentTokens)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--accent-green)]"
                            style={{ width: `${costPercent}%` }}
                          />
                        </div>
                        <span className="font-mono font-medium text-[var(--text-primary)]">{formatCost(agent.cost)}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-white/[0.02]">
                <td className="px-5 py-3 font-medium text-[var(--text-primary)]">Total</td>
                <td className="px-5 py-3" />
                <td className="px-5 py-3 text-right font-mono font-medium text-[var(--text-primary)]">
                  {formatTokens(metrics.reduce((s, m) => s + m.input_tokens, 0))}
                </td>
                <td className="px-5 py-3 text-right font-mono font-medium text-[var(--text-primary)]">
                  {formatTokens(metrics.reduce((s, m) => s + m.output_tokens, 0))}
                </td>
                <td className="px-5 py-3 text-right font-mono font-medium text-[var(--text-primary)]">
                  {formatTokens(totalTokens)}
                </td>
                <td className="px-5 py-3 text-right font-mono font-semibold text-[var(--accent-green)]">
                  {formatCost(totalCost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
