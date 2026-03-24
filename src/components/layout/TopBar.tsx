'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, CheckCheck, AlertTriangle, CheckCircle, Search } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

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

const initialNotifications = [
  { id: '1', type: 'task', text: 'Quill completed "Newsletter Draft #47"', time: '2m ago', unread: true },
  { id: '2', type: 'approval', text: 'Ralph needs approval on deployment PR', time: '15m ago', unread: true },
  { id: '3', type: 'alert', text: 'Cost alert: approaching $50 daily limit', time: '1h ago', unread: true },
  { id: '4', type: 'task', text: 'Scout completed "Competitor Analysis"', time: '2h ago', unread: false },
]

function NotifIcon({ type }: { type: string }) {
  if (type === 'approval') return <AlertTriangle size={13} className="text-yellow-400 shrink-0" />
  if (type === 'alert') return <AlertTriangle size={13} className="text-red-400 shrink-0" />
  return <CheckCircle size={13} className="text-green-400 shrink-0" />
}

export function TopBar() {
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? 'Dashboard'

  const [clock, setClock] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => n.unread).length

  useEffect(() => {
    function updateClock() {
      setClock(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }))
    }
    updateClock()
    const interval = setInterval(updateClock, 10_000)
    return () => clearInterval(interval)
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

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="px-2 py-0.5 rounded bg-[var(--accent-green)]/10 text-[var(--accent-green)]">
            13 Agents
          </span>
          <span className="px-2 py-0.5 rounded bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
            3 Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search — keyboard shortcut ⌘K handled by CommandPalette */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border)] text-[var(--text-muted)] text-sm cursor-pointer hover:bg-white/10 transition-colors select-none">
          <Search size={14} />
          <span>Search ⌘K</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
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
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${n.unread ? 'bg-white/[0.02]' : ''}`}
                  >
                    <div className="mt-0.5">
                      <NotifIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-200 leading-snug">{n.text}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{n.time}</p>
                    </div>
                    {n.unread && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </div>

              <div className="px-4 py-2.5 border-t border-white/10">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clock */}
        <time className="text-sm text-[var(--text-muted)] font-mono" aria-label="Current time">
          {clock}
        </time>
      </div>
    </header>
  )
}
