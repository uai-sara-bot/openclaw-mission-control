'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { supabase } from '@/lib/supabase'
import { DollarSign, Zap, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface CostRecord {
  id: string
  agent_id?: string
  agent_name: string
  model: string
  input_tokens: number
  output_tokens: number
  cost: number
  created_at: string
  date?: string
}

interface DailyUsage {
  date: string
  input: number
  output: number
  cost: number
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`
}

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

// Aggregate cost records by agent
function aggregateByAgent(records: CostRecord[]) {
  const map = new Map<string, { agent_name: string; model: string; input_tokens: number; output_tokens: number; cost: number }>()
  for (const r of records) {
    const key = r.agent_name
    const existing = map.get(key)
    if (existing) {
      existing.input_tokens += r.input_tokens || 0
      existing.output_tokens += r.output_tokens || 0
      existing.cost += r.cost || 0
      // Keep most recent model
    } else {
      map.set(key, { agent_name: r.agent_name, model: r.model, input_tokens: r.input_tokens || 0, output_tokens: r.output_tokens || 0, cost: r.cost || 0 })
    }
  }
  return [...map.values()].sort((a, b) => b.cost - a.cost)
}

// Aggregate by date for chart
function aggregateByDate(records: CostRecord[]): DailyUsage[] {
  const map = new Map<string, DailyUsage>()
  for (const r of records) {
    const date = (r.date || r.created_at.split('T')[0])
    const label = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const existing = map.get(date)
    if (existing) {
      existing.input += r.input_tokens || 0
      existing.output += r.output_tokens || 0
      existing.cost += r.cost || 0
    } else {
      map.set(date, { date: label, input: r.input_tokens || 0, output: r.output_tokens || 0, cost: r.cost || 0 })
    }
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, v]) => v).slice(-7)
}

export default function CostsPage() {
  const [records, setRecords] = useState<CostRecord[]>([])
  const [loading, setLoading] = useState(true)
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  useEffect(() => {
    async function fetchData() {
      // Last 30 days
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from('costs')
        .select('*')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
      if (error) console.error('Costs fetch error:', error)
      if (data) setRecords(data)
      setLoading(false)
    }
    fetchData()

    const sub = supabase
      .channel('costs-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'costs' }, (payload) => {
        setRecords(prev => [payload.new as CostRecord, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const agentTotals = aggregateByAgent(records)
  const dailyUsage = aggregateByDate(records)
  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0)
  const totalTokens = records.reduce((sum, r) => sum + (r.input_tokens || 0) + (r.output_tokens || 0), 0)
  const avgCostPerRecord = records.length > 0 ? totalCost / records.length : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-teal-400 animate-pulse">Loading cost data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Cost Tracker</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Token usage and costs across all agents (last 30 days)</p>
      </div>

      {records.length === 0 ? (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-12 text-center">
          <DollarSign size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
          <p className="text-sm text-[var(--text-muted)]">No cost data yet.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">Token usage from agents will appear here automatically.</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--text-secondary)]">Total Cost (30d)</span>
                <span className="p-2 rounded-lg bg-[var(--accent-green)]/10">
                  <DollarSign size={16} className="text-[var(--accent-green)]" />
                </span>
              </div>
              <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono">{formatCost(totalCost)}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-[var(--text-muted)]">
                {agentTotals.length} agents
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--text-secondary)]">Total Tokens (30d)</span>
                <span className="p-2 rounded-lg bg-[var(--accent-blue)]/10">
                  <Zap size={16} className="text-[var(--accent-blue)]" />
                </span>
              </div>
              <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono">{formatTokens(totalTokens)}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-[var(--text-muted)]">
                {records.length} records
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--text-secondary)]">Avg Cost / Record</span>
                <span className="p-2 rounded-lg bg-[var(--accent-purple)]/10">
                  <TrendingUp size={16} className="text-[var(--accent-purple)]" />
                </span>
              </div>
              <p className="text-2xl font-semibold text-[var(--text-primary)] font-mono">{formatCost(avgCostPerRecord)}</p>
            </div>
          </div>

          {/* Chart */}
          {dailyUsage.length > 1 && (
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
              <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">Token Usage — Last 7 Days</h2>
              <div className="h-72">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyUsage} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                      <YAxis tickFormatter={formatTokens} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                      <Line type="monotone" dataKey="input" name="Input Tokens" stroke="var(--accent-blue)" strokeWidth={2} dot={{ fill: 'var(--accent-blue)', r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="output" name="Output Tokens" stroke="var(--accent-purple)" strokeWidth={2} dot={{ fill: 'var(--accent-purple)', r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">Loading chart...</div>
                )}
              </div>
            </div>
          )}

          {/* Per-Agent Breakdown */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)]">
              <h2 className="text-sm font-medium text-[var(--text-primary)]">Per-Agent Cost Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left">
                    <th className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Agent</th>
                    <th className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Model</th>
                    <th className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Input Tokens</th>
                    <th className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Output Tokens</th>
                    <th className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Total Tokens</th>
                    <th className="px-5 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-right">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {agentTotals.map((agent, idx) => {
                    const totalAgentTokens = agent.input_tokens + agent.output_tokens
                    const costPercent = totalCost > 0 ? (agent.cost / totalCost) * 100 : 0
                    return (
                      <tr key={idx} className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-medium text-[var(--text-primary)] font-mono">{agent.agent_name}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white/5 text-[var(--text-secondary)]">
                            {agent.model}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--text-secondary)]">{formatTokens(agent.input_tokens)}</td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--text-secondary)]">{formatTokens(agent.output_tokens)}</td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--text-primary)]">{formatTokens(totalAgentTokens)}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-[var(--accent-green)]" style={{ width: `${costPercent}%` }} />
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
                      {formatTokens(agentTotals.reduce((s, a) => s + a.input_tokens, 0))}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-medium text-[var(--text-primary)]">
                      {formatTokens(agentTotals.reduce((s, a) => s + a.output_tokens, 0))}
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
        </>
      )}
    </div>
  )
}
