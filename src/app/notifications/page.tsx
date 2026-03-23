'use client'

import { useState } from 'react'
import {
  Bell, AlertTriangle, CheckCircle, Info, XCircle, MessageSquare,
  DollarSign, Shield, Bot, Filter, Check, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NotificationType = 'error' | 'warning' | 'success' | 'info' | 'task' | 'cost' | 'security'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  agent: string | null
}

const sampleNotifications: Notification[] = [
  { id: '1', type: 'error', title: 'Agent Connection Failed', message: 'ElevenLabs integration lost connection — API key expired. Re-authenticate to restore voice synthesis.', timestamp: '2026-03-23T14:30:00Z', read: false, agent: null },
  { id: '2', type: 'warning', title: 'Trust Score Alert', message: 'whatsapp-cli agent trust score dropped below 60. Review recent actions and PII handling.', timestamp: '2026-03-23T14:15:00Z', read: false, agent: 'whatsapp-cli' },
  { id: '3', type: 'task', title: 'Task Needs Review', message: '"Evaluate vector DB options" moved to Review by research agent. Human review required.', timestamp: '2026-03-23T13:58:00Z', read: false, agent: 'research' },
  { id: '4', type: 'security', title: 'Failed Login Attempt', message: 'Invalid password from IP 203.0.xx.xx — 1 of 3 attempts. No action required yet.', timestamp: '2026-03-23T13:45:00Z', read: false, agent: null },
  { id: '5', type: 'cost', title: 'Daily Spend Update', message: 'Current daily spend: $47.20 (94% of $50 threshold). Monitor closely.', timestamp: '2026-03-23T12:00:00Z', read: true, agent: null },
  { id: '6', type: 'success', title: 'Build Passed', message: 'ENGAGE frontend build completed — all 47 tests passed.', timestamp: '2026-03-23T11:45:00Z', read: true, agent: 'engage-dev' },
  { id: '7', type: 'info', title: 'Agent Started', message: 'general-work agent connected to gateway and is ready to accept tasks.', timestamp: '2026-03-23T11:22:00Z', read: true, agent: 'general-work' },
  { id: '8', type: 'security', title: 'Token Rotated', message: 'Gateway authentication token was auto-rotated successfully.', timestamp: '2026-03-23T10:15:00Z', read: true, agent: null },
  { id: '9', type: 'warning', title: 'SearXNG Unreachable', message: 'Local SearXNG instance not responding. Research agent web search degraded.', timestamp: '2026-03-23T09:30:00Z', read: true, agent: 'research' },
  { id: '10', type: 'info', title: 'Security Audit Complete', message: 'Daily audit completed for 9 agents. 0 critical issues, 2 warnings.', timestamp: '2026-03-23T06:00:00Z', read: true, agent: null },
  { id: '11', type: 'cost', title: 'Weekly Cost Report', message: 'Week ending Mar 22: total spend $312.40 across all models. 8% under budget.', timestamp: '2026-03-22T23:00:00Z', read: true, agent: null },
  { id: '12', type: 'success', title: 'Memory Cleanup', message: 'Expired memory files purged. Freed 12 MB across 3 agents.', timestamp: '2026-03-22T18:00:00Z', read: true, agent: 'main' },
]

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  error: { icon: XCircle, color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10' },
  warning: { icon: AlertTriangle, color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10' },
  success: { icon: CheckCircle, color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10' },
  info: { icon: Info, color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
  task: { icon: MessageSquare, color: 'text-[var(--accent-purple)]', bg: 'bg-[var(--accent-purple)]/10' },
  cost: { icon: DollarSign, color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10' },
  security: { icon: Shield, color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date('2026-03-23T15:00:00Z')
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications)
  const [typeFilter, setTypeFilter] = useState<NotificationType | null>(null)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const filtered = notifications.filter(n => {
    if (typeFilter && n.type !== typeFilter) return false
    if (showUnreadOnly && n.read) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/10 transition-colors"
          >
            <Check size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--text-muted)]" />
          <div className="flex gap-1">
            <button
              onClick={() => setTypeFilter(null)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs transition-colors',
                typeFilter === null && !showUnreadOnly
                  ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              All
            </button>
            {(Object.keys(typeConfig) as NotificationType[]).map(type => {
              const config = typeConfig[type]
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs transition-colors capitalize flex items-center gap-1',
                    typeFilter === type
                      ? `${config.bg} ${config.color}`
                      : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {type}
                </button>
              )
            })}
          </div>
        </div>
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs transition-colors',
            showUnreadOnly
              ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
              : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          )}
        >
          Unread only
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-8 text-center">
            <Bell size={24} className="mx-auto text-[var(--text-muted)] mb-2" />
            <p className="text-sm text-[var(--text-muted)]">No notifications match your filters.</p>
          </div>
        ) : (
          filtered.map(notification => {
            const config = typeConfig[notification.type]
            const Icon = config.icon
            return (
              <div
                key={notification.id}
                className={cn(
                  'bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 transition-colors group',
                  !notification.read && 'border-l-2 border-l-[var(--accent-blue)]'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={cn(
                        'text-sm text-[var(--text-primary)]',
                        !notification.read && 'font-medium'
                      )}>
                        {notification.title}
                      </h3>
                      {notification.agent && (
                        <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                          <Bot size={10} />
                          {notification.agent}
                        </span>
                      )}
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-[var(--accent-blue)]" />
                      )}
                      <span className="ml-auto text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{notification.message}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/10 transition-colors"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(notification.id)}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors"
                      title="Dismiss"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Showing {filtered.length} of {notifications.length} notifications
      </p>
    </div>
  )
}
