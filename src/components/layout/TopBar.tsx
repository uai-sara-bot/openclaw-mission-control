'use client'

import { Search, Bell } from 'lucide-react'

export function TopBar() {
  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--bg-secondary)]/80 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Dashboard</h2>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="px-2 py-0.5 rounded bg-[var(--accent-green)]/10 text-[var(--accent-green)]">
            13 Agents
          </span>
          <span className="px-2 py-0.5 rounded bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
            3 Active
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border)] text-[var(--text-muted)] text-sm">
          <Search size={14} />
          <span>Search...</span>
          <kbd className="ml-4 px-1.5 py-0.5 rounded bg-white/10 text-xs">⌘K</kbd>
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell size={18} className="text-[var(--text-secondary)]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--accent-red)]" />
        </button>

        {/* Clock */}
        <span className="text-sm text-[var(--text-muted)] font-mono">
          {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </header>
  )
}
