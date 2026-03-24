'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, UserCircle, ClipboardList, Activity,
  DollarSign, Calendar, Brain, Settings, Bell,
  Zap, Shield, FolderOpen, Globe, Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Personas', href: '/personas', icon: UserCircle },
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
  { name: 'Gateway', href: '/gateway', icon: Globe },
  { name: 'Office', href: '/office', icon: Building2 },
]

const extendedNavigation = [
  { name: 'Content', href: '/content', icon: Video },
  { name: 'Approvals', href: '/approvals', icon: CheckSquare },
  { name: 'Council', href: '/council', icon: MessageSquare },
  { name: 'Projects', href: '/projects', icon: Folder },
  { name: 'Docs', href: '/docs', icon: FileText },
  { name: 'People', href: '/people', icon: Users2 },
  { name: 'Office', href: '/office', icon: Building2 },
  { name: 'Team', href: '/team', icon: Network },
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
        <div className="border-t border-white/5 my-2 pt-2">
          <div className="px-3 py-1 text-[10px] text-gray-600 uppercase tracking-wider mb-1">More</div>
          {extendedNavigation.map((item) => {
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
        </div>
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
