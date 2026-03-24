'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Approval {
  id: string
  title: string
  description: string
  requesting_agent: string
  context: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  resolved_at: string | null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const agentColor: Record<string, string> = {}
const AGENT_COLORS = [
  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'bg-green-500/20 text-green-300 border-green-500/30',
]
let colorIdx = 0
function getAgentColor(agent: string) {
  if (!agentColor[agent]) {
    agentColor[agent] = AGENT_COLORS[colorIdx % AGENT_COLORS.length]
    colorIdx++
  }
  return agentColor[agent]
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('approvals').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setApprovals(data)
        setLoading(false)
      })

    const sub = supabase.channel('approvals-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approvals' }, (payload) => {
        if (payload.eventType === 'INSERT') setApprovals(prev => [payload.new as Approval, ...prev])
        if (payload.eventType === 'UPDATE') setApprovals(prev => prev.map(a => a.id === payload.new.id ? payload.new as Approval : a))
        if (payload.eventType === 'DELETE') setApprovals(prev => prev.filter(a => a.id !== (payload.old as Approval).id))
      }).subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const handle = async (id: string, action: 'approved' | 'rejected') => {
    await supabase.from('approvals').update({ status: action, resolved_at: new Date().toISOString() }).eq('id', id)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-teal-400">Loading...</div>

  const pending = approvals.filter(a => a.status === 'pending').length
  const approved = approvals.filter(a => a.status === 'approved').length
  const rejected = approvals.filter(a => a.status === 'rejected').length

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Approvals</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Items waiting for your sign-off
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg p-4 border border-white/10" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-orange-400" />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pending</span>
          </div>
          <p className="text-3xl font-bold text-white">{pending}</p>
        </div>
        <div className="rounded-lg p-4 border border-white/10" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Approved</span>
          </div>
          <p className="text-3xl font-bold text-white">{approved}</p>
        </div>
        <div className="rounded-lg p-4 border border-white/10" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={16} className="text-red-400" />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Rejected</span>
          </div>
          <p className="text-3xl font-bold text-white">{rejected}</p>
        </div>
      </div>

      {/* Approval Cards */}
      {approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <CheckCircle size={40} className="mb-3 text-teal-500/40" />
          <p className="text-lg mb-2">No pending approvals</p>
          <p className="text-sm">Agents will request approval here when needed.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map(approval => (
            <div
              key={approval.id}
              className={`rounded-lg p-5 border transition-colors ${
                approval.status === 'approved' ? 'border-green-500/30 opacity-60' :
                approval.status === 'rejected' ? 'border-red-500/30 opacity-60' :
                'border-white/10 hover:border-white/20'
              }`}
              style={{ background: 'var(--bg-secondary)' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-white">{approval.title}</h3>
                    {approval.status === 'pending' && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        <AlertCircle size={10} />
                        Pending
                      </span>
                    )}
                    {approval.status === 'approved' && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                        <CheckCircle size={10} />
                        Approved
                      </span>
                    )}
                    {approval.status === 'rejected' && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        <XCircle size={10} />
                        Rejected
                      </span>
                    )}
                  </div>

                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{approval.description}</p>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getAgentColor(approval.requesting_agent)}`}>
                      {approval.requesting_agent}
                    </span>
                    {approval.context && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{approval.context}</span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(approval.created_at)}</span>
                  </div>
                </div>

                {approval.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handle(approval.id, 'rejected')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium transition-colors"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                    <button
                      onClick={() => handle(approval.id, 'approved')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium transition-colors"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
