'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface Approval {
  id: string
  title: string
  description: string
  agent: string
  context: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

const initialApprovals: Approval[] = [
  { id: '1', title: 'Publish newsletter draft', description: 'Weekly AI newsletter is ready for review', agent: 'Quill', context: 'Draft covers OpenAI vs Anthropic Q1 comparison', status: 'pending', createdAt: '2h ago' },
  { id: '2', title: 'Deploy new auth middleware', description: 'Codex completed refactor, tests passing', agent: 'Codex', context: 'PR #47 - affects login flow', status: 'pending', createdAt: '4h ago' },
  { id: '3', title: 'Spend $50 on API credits', description: 'Scout needs additional GPT-5 credits for research', agent: 'Scout', context: 'Monthly budget headroom: $200', status: 'pending', createdAt: '1h ago' },
]

const agentColor: Record<string, string> = {
  Quill: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Codex: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Scout: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)

  const handle = (id: string, action: 'approved' | 'rejected') => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action } : a))
  }

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
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Approved Today</span>
          </div>
          <p className="text-3xl font-bold text-white">{approved}</p>
        </div>
        <div className="rounded-lg p-4 border border-white/10" style={{ background: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={16} className="text-red-400" />
            <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Rejected Today</span>
          </div>
          <p className="text-3xl font-bold text-white">{rejected}</p>
        </div>
      </div>

      {/* Approval Cards */}
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
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${agentColor[approval.agent] ?? 'bg-white/10 text-white/60 border-white/20'}`}>
                    {approval.agent}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{approval.context}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{approval.createdAt}</span>
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

      {approvals.every(a => a.status !== 'pending') && (
        <div className="mt-8 text-center py-12 rounded-lg border border-dashed border-white/10">
          <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
          <p className="text-white font-medium">All caught up!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>No pending approvals.</p>
        </div>
      )}
    </div>
  )
}
