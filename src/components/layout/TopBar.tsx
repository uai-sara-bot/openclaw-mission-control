'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, CheckCheck, AlertTriangle, CheckCircle, Info, XCircle, Search, PauseCircle } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import toast, { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/agents': 'Agents',
  '/tasks': 'Task Board',
  '/activity': 'Activity Feed',
  '/costs': 'Cost Tracker',
  '/calendar': 'Calendar / Cron',
  '/memory': 'Memory Browser',
  '/skills': 'Skills',
  '/integrations': 'Integrations',
  '/security': 'Security',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/gateway': 'Gateway',
  '/office': 'The Office',
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  created_at: string
  read: boolean
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'error') return <XCircle size={13} className="text-red-400 shrink-0" />
  if (type === 'warning') return <AlertTriangle size={13} className="text-yellow-400 shrink-0" />
  if (type === 'success') return <CheckCircle size={13} className="text-green-400 shrink-0" />
  return <Info size={13} className="text-blue-400 shrink-0" />
}

function formatTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

export function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const title = pageTitles[pathname] ?? 'Dashboard'

  const [clock, setClock] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [agentCount, setAgentCount] = useState<number | null>(null)
  const [activeCount, setActiveCount] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Clock
  useEffect(() => {
    function updateClock() {
      setClock(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }))
    }
    updateClock()
    const interval = setInterval(updateClock, 10_000)
    return () => clearInterval(interval)
  }, [])

  // Fetch notifications + agent counts
  useEffect(() => {
    async function fetchData() {
      const [{ data: notifData }, { data: agentData }] = await Promise.all([
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('agents').select('id, status'),
      ])
      if (notifData) setNotifications(notifData)
      if (agentData) {
        setAgentCount(agentData.length)
        setActiveCount(agentData.filter(a => a.status === 'active' || a.status === 'working').length)
      }
    }
    fetchData()

    // Real-time notifications
    const sub = supabase
      .channel('topbar-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload.eventType === 'INSERT') setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 19)])
        if (payload.eventType === 'UPDATE') setNotifications(prev => prev.map(n => n.id === (payload.new as Notification).id ? payload.new as Notification : n))
        if (payload.eventType === 'DELETE') setNotifications(prev => prev.filter(n => n.id !== (payload.old as Notification).id))
      })
      .subscribe()

    // Real-time agent status
    const agentSub = supabase
      .channel('topbar-agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        supabase.from('agents').select('id, status').then(({ data }) => {
          if (data) {
            setAgentCount(data.length)
            setActiveCount(data.filter(a => a.status === 'active' || a.status === 'working').length)
          }
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
      supabase.removeChannel(agentSub)
    }
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [notifOpen])

  async function markAllRead() {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    if (unreadIds.length > 0) {
      await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
    }
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <header className="h-14 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)]">
            {agentCount !== null && (
              <span className="px-2 py-0.5 rounded bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
                {agentCount} Agents
              </span>
            )}
            {activeCount !== null && activeCount > 0 && (
              <span className="px-2 py-0.5 rounded bg-[var(--accent-green)]/10 text-[var(--accent-green)]">
                {activeCount} Active
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border)] text-[var(--text-muted)] text-sm cursor-pointer hover:bg-white/10 transition-colors select-none">
            <Search size={14} />
            <span>Search ⌘K</span>
          </div>

          {/* Pause Button */}
          <button
            onClick={() => toast('Agents paused')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-sm font-medium transition-colors border border-teal-500/20"
            aria-label="Pause agents"
          >
            <PauseCircle size={14} />
            <span>Pause</span>
          </button>

          {/* Notifications Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="View notifications"
            >
              <Bell size={18} className="text-[var(--text-secondary)]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-[var(--accent-red)] text-white text-[9px] font-bold px-0.5">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 bg-[#111118] border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs text-gray-400">{unreadCount} unread</span>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-gray-500">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 10).map(n => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.read ? 'bg-white/[0.02]' : ''}`}
                      >
                        <div className="mt-0.5">
                          <NotifIcon type={n.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-200 leading-snug font-medium">{n.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{n.message}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{formatTime(n.created_at)}</p>
                        </div>
                        {!n.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                  <button
                    onClick={() => { setNotifOpen(false); router.push('/notifications') }}
                    className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    View all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Clock */}
          <time className="text-sm text-[var(--text-muted)] font-mono" aria-label="Current time">
            {clock}
          </time>
        </div>
      </header>
    </>
  )
}
