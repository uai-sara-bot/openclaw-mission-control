'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, ClipboardList, Activity, 
  DollarSign, Calendar, Brain, Settings, Bell,
  Zap, Shield, FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'Activity', href: '/activity', icon: Activity },
  { name: 'Costs', href: '/costs', icon: DollarSign },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Memory', href: '/memory', icon: Brain },
  { name: 'Skills', href: '/skills', icon: Zap },
  { name: 'Integrations', href: '/integrations', icon: FolderOpen },
  { name: 'Security', href: '/security', icon: Shield },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white font-bold text-sm">
            MC
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[var(--text-primary)]">Mission Control</h1>
            <p className="text-xs text-[var(--text-muted)]">OpenClaw</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Gateway Status */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
          <span className="text-[var(--text-muted)]">Gateway Connected</span>
        </div>
      </div>
    </aside>
  )
}
