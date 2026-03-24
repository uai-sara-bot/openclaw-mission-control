'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
  created_at: string
  read: boolean
  agent?: string | null
  agent_name?: string | null
}

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  error: { icon: XCircle, color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10' },
  warning: { icon: AlertTriangle, color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10' },
  success: { icon: CheckCircle, color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10' },
  info: { icon: Info, color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
  task: { icon: MessageSquare, color: 'text-[var(--accent-purple)]', bg: 'bg-[var(--accent-purple)]/10' },
  cost: { icon: DollarSign, color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10' },
  security: { icon: Shield, color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
}

function getTypeConfig(type: string) {
  return typeConfig[type as NotificationType] || typeConfig.info
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) console.error('Notifications fetch error:', error)
      if (data) setNotifications(data)
      setLoading(false)
    }
    fetchData()

    const sub = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.eventType === 'INSERT') setNotifications(prev => [payload.new as Notification, ...prev])
        if (payload.eventType === 'UPDATE') setNotifications(prev => prev.map(n => n.id === (payload.new as Notification).id ? payload.new as Notification : n))
        if (payload.eventType === 'DELETE') setNotifications(prev => prev.filter(n => n.id !== (payload.old as Notification).id))
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const filtered = notifications.filter(n => {
    if (typeFilter && n.type !== typeFilter) return false
    if (showUnreadOnly && n.read) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  async function markAsRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await supabase.from('notifications').update({ read: true }).eq('id', id)
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    if (unreadIds.length > 0) {
      await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
    }
  }

  async function dismiss(id: string) {
    setNotifications(prev => prev.filter(n => n.id !== id))
    await supabase.from('notifications').delete().eq('id', id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-teal-400 animate-pulse">Loading notifications...</div>
      </div>
    )
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
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--text-muted)]" />
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setTypeFilter(null)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs transition-colors',
                typeFilter === null ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                    'px-2.5 py-1 rounded-md text-xs transition-colors capitalize',
                    typeFilter === type ? `${config.bg} ${config.color}` : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
            showUnreadOnly ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          )}
        >
          Unread only
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-12 text-center">
            <Bell size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
            <p className="text-sm text-[var(--text-muted)]">No notifications yet.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">Alerts and events from agents will appear here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-8 text-center">
            <Bell size={24} className="mx-auto text-[var(--text-muted)] mb-2" />
            <p className="text-sm text-[var(--text-muted)]">No notifications match your filters.</p>
          </div>
        ) : (
          filtered.map(notification => {
            const config = getTypeConfig(notification.type)
            const Icon = config.icon
            const agentName = notification.agent || notification.agent_name
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
                      <h3 className={cn('text-sm text-[var(--text-primary)]', !notification.read && 'font-medium')}>
                        {notification.title}
                      </h3>
                      {agentName && (
                        <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                          <Bot size={10} />
                          {agentName}
                        </span>
                      )}
                      {!notification.read && <div className="w-2 h-2 rounded-full bg-[var(--accent-blue)]" />}
                      <span className="ml-auto text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                        {formatTime(notification.created_at)}
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
