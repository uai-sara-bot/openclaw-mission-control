'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Brain, FileText, Calendar } from 'lucide-react'

interface MemoryEntry {
  id: string
  date?: string
  title?: string
  content: string
  size?: number
  word_count?: number
  created_at: string
  agent_name?: string
  entry_type?: string
}

function formatDate(entry: MemoryEntry) {
  if (entry.date) return entry.date
  return new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatSize(bytes?: number) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-white mb-4 mt-6 first:mt-0">{line.slice(2)}</h1>
    if (line.startsWith('## ')) return <h2 key={i} className="text-base font-semibold text-teal-300 mb-2 mt-5">{line.slice(3)}</h2>
    if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold text-white mb-2 mt-4">{line.slice(4)}</h3>
    if (line.startsWith('- ')) return <li key={i} className="ml-4 text-sm mb-1 list-disc" style={{ color: 'var(--text-secondary)' }}>{line.slice(2)}</li>
    if (line === '') return <div key={i} className="mb-2" />
    return <p key={i} className="text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>{line}</p>
  })
}

// Group entries by time period
function groupEntries(entries: MemoryEntry[]) {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  const groups: { label: string; entries: MemoryEntry[] }[] = [
    { label: 'This Week', entries: [] },
    { label: 'Last Week', entries: [] },
    { label: 'Older', entries: [] },
  ]

  entries.forEach(entry => {
    const date = new Date(entry.created_at)
    if (date >= weekAgo) groups[0].entries.push(entry)
    else if (date >= twoWeeksAgo) groups[1].entries.push(entry)
    else groups[2].entries.push(entry)
  })

  return groups.filter(g => g.entries.length > 0)
}

export default function MemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('memory_entries')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) console.error('Memory fetch error:', error)
      if (data) {
        setEntries(data)
        if (data.length > 0) setSelected(data[0].id)
      }
      setLoading(false)
    }
    fetchData()

    const sub = supabase
      .channel('memory-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memory_entries' }, (payload) => {
        setEntries(prev => [payload.new as MemoryEntry, ...prev])
        setSelected(payload.new.id)
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const filtered = entries.filter(e =>
    !search ||
    formatDate(e).toLowerCase().includes(search.toLowerCase()) ||
    (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase())
  )

  const selectedEntry = entries.find(e => e.id === selected)
  const groups = groupEntries(filtered)

  const totalWords = entries.reduce((sum, e) => sum + (e.word_count || e.content.split(/\s+/).length), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-teal-400 animate-pulse">Loading memory...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Column */}
      <div className="w-72 flex flex-col border-r border-white/10" style={{ background: 'var(--bg-secondary)' }}>
        {/* Stats */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-teal-400" />
            <span className="text-sm font-semibold text-white">Long-Term Memory</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2 bg-white/5 text-center">
              <p className="text-lg font-bold text-teal-400">{entries.length}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>journal entries</p>
            </div>
            <div className="rounded-lg p-2 bg-white/5 text-center">
              <p className="text-lg font-bold text-purple-400">{totalWords > 1000 ? `${(totalWords / 1000).toFixed(0)}K` : totalWords}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>total words</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-white/10">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Search size={12} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search memory..."
              className="bg-transparent text-xs text-white placeholder-white/30 outline-none flex-1"
            />
          </div>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-center">
              {entries.length === 0 ? (
                <p className="text-xs text-gray-600">No memory entries yet.</p>
              ) : (
                <p className="text-xs text-gray-600">No results for &quot;{search}&quot;</p>
              )}
            </div>
          ) : (
            groups.map(group => (
              <div key={group.label} className="mb-2">
                <p className="text-[10px] uppercase tracking-widest font-semibold px-3 py-2" style={{ color: 'var(--text-muted)' }}>
                  {group.label}
                </p>
                {group.entries.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => setSelected(entry.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-l-2 ${
                      selected === entry.id
                        ? 'border-l-teal-500 bg-teal-500/10'
                        : 'border-l-transparent hover:bg-white/5'
                    }`}
                  >
                    <Calendar size={13} className={selected === entry.id ? 'text-teal-400' : 'text-white/30'} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selected === entry.id ? 'text-teal-300' : 'text-white'}`}>
                        {entry.title || formatDate(entry)}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {formatSize(entry.size) && `${formatSize(entry.size)} · `}
                        {(entry.word_count || entry.content.split(/\s+/).length).toLocaleString()} words
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column — Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Brain size={48} className="text-gray-700 mb-4" />
            <p className="text-gray-400 text-sm">No memory entries yet.</p>
            <p className="text-gray-600 text-xs mt-2">Agents will store journal entries and notes here automatically.</p>
          </div>
        ) : selectedEntry ? (
          <>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <FileText size={16} className="text-teal-400" />
              <div>
                <p className="text-sm font-medium text-white">{selectedEntry.title || formatDate(selectedEntry)}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatSize(selectedEntry.size) && `${formatSize(selectedEntry.size)} · `}
                  {(selectedEntry.word_count || selectedEntry.content.split(/\s+/).length).toLocaleString()} words
                  {selectedEntry.agent_name && ` · ${selectedEntry.agent_name}`}
                </p>
              </div>
            </div>
            <div>{renderContent(selectedEntry.content)}</div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'var(--text-muted)' }}>Select an entry</p>
          </div>
        )}
      </div>
    </div>
  )
}
