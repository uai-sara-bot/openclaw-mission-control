'use client'
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

const commands = [
  { label: 'Go to Tasks', href: '/tasks', category: 'Navigation' },
  { label: 'Go to Agents', href: '/agents', category: 'Navigation' },
  { label: 'Go to Content', href: '/content', category: 'Navigation' },
  { label: 'Go to Calendar', href: '/calendar', category: 'Navigation' },
  { label: 'Go to Memory', href: '/memory', category: 'Navigation' },
  { label: 'Go to Office', href: '/office', category: 'Navigation' },
  { label: 'Go to Team', href: '/team', category: 'Navigation' },
  { label: 'Go to Projects', href: '/projects', category: 'Navigation' },
  { label: 'Go to Docs', href: '/docs', category: 'Navigation' },
  { label: 'Go to People', href: '/people', category: 'Navigation' },
  { label: 'Ping Henry', href: '#ping', category: 'Actions' },
  { label: 'Pause all agents', href: '#pause', category: 'Actions' },
  { label: 'New Task', href: '/tasks?new=1', category: 'Actions' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!open) return null

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-[#111118] border border-white/20 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search size={16} className="text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
          />
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.map(cmd => (
            <button
              key={cmd.label}
              onClick={() => { setOpen(false); router.push(cmd.href) }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 text-left group"
            >
              <span className="text-sm text-white">{cmd.label}</span>
              <span className="text-xs text-gray-500">{cmd.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
