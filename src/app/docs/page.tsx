'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Doc {
  id: string
  filename: string
  content: string
  tags: string[] | null
  format: string | null
  created_by: string | null
  word_count: number | null
  created_at: string
}

function renderMarkdown(content: string) {
  const lines = content.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">{line.slice(2)}</h1>
    if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-teal-300 mb-2 mt-5">{line.slice(3)}</h2>
    if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-white mb-2 mt-4">{line.slice(4)}</h3>
    if (line.startsWith('- ')) return <li key={i} className="ml-4 text-sm mb-1 list-disc" style={{ color: 'var(--text-secondary)' }}>{line.slice(2)}</li>
    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-white mb-2 text-sm">{line.slice(2, -2)}</p>
    if (line.match(/^\d+\. /)) return <p key={i} className="ml-4 text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{line}</p>
    if (line === '') return <div key={i} className="mb-2" />
    return <p key={i} className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{line}</p>
  })
}

const tagColor: Record<string, string> = {
  journal: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  newsletter: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  docs: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  content: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  youtube: 'bg-red-500/20 text-red-300 border-red-500/30',
  other: 'bg-white/10 text-white/60 border-white/20',
}

function getDocTag(doc: Doc): string {
  if (doc.tags && doc.tags.length > 0) return doc.tags[0]
  return doc.format || 'other'
}

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('documents').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setDocs(data)
          if (data.length > 0) setSelectedId(data[0].id)
        }
        setLoading(false)
      })

    const sub = supabase.channel('documents-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'documents' }, (payload) => {
        setDocs(prev => [payload.new as Doc, ...prev])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'documents' }, (payload) => {
        setDocs(prev => prev.map(d => d.id === payload.new.id ? payload.new as Doc : d))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'documents' }, (payload) => {
        setDocs(prev => prev.filter(d => d.id !== (payload.old as Doc).id))
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  // Build tag list from actual data
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    docs.forEach(d => {
      if (d.tags) d.tags.forEach(t => tagSet.add(t))
      if (d.format) tagSet.add(d.format)
    })
    return ['all', ...Array.from(tagSet)]
  }, [docs])

  const filtered = useMemo(() => {
    return docs.filter(d => {
      const docTag = getDocTag(d)
      const matchesTag = selectedTag === 'all' || docTag === selectedTag ||
        (d.tags && d.tags.includes(selectedTag))
      const matchesSearch = !search ||
        d.filename.toLowerCase().includes(search.toLowerCase()) ||
        (d.content && d.content.toLowerCase().includes(search.toLowerCase()))
      return matchesTag && matchesSearch
    })
  }, [docs, selectedTag, search])

  const selectedDoc = docs.find(d => d.id === selectedId) ?? null

  if (loading) return <div className="flex items-center justify-center h-64 text-teal-400">Loading...</div>

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FileText size={40} className="mb-3 text-teal-500/40" />
        <p className="text-lg mb-2">No documents yet</p>
        <p className="text-sm">Agents save documents here automatically when they create content, plans, or reports.</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Panel 1 — File Tree */}
      <div className="w-64 flex flex-col border-r border-white/10" style={{ background: 'var(--bg-secondary)' }}>
        <div className="p-3 border-b border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-white">Docs</p>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Search size={12} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-xs text-white placeholder-white/30 outline-none flex-1"
            />
          </div>
        </div>

        {/* Tag filters */}
        <div className="px-3 py-2 border-b border-white/10">
          <div className="flex flex-wrap gap-1">
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                  selectedTag === t ? 'bg-teal-500/20 text-teal-300' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map(doc => {
            const docTag = getDocTag(doc)
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedId(doc.id)}
                className={`w-full flex items-start gap-2 p-2 rounded-lg text-left mb-1 transition-colors ${
                  selectedId === doc.id ? 'bg-teal-500/10' : 'hover:bg-white/5'
                }`}
              >
                <FileText size={13} className={selectedId === doc.id ? 'text-teal-400 mt-0.5' : 'text-white/30 mt-0.5'} />
                <div>
                  <p className={`text-xs leading-tight ${selectedId === doc.id ? 'text-teal-300' : 'text-white/70'}`}>
                    {doc.filename}
                  </p>
                  <span className={`text-[9px] px-1 py-0.5 rounded mt-1 inline-block border ${tagColor[docTag] ?? 'bg-white/10 text-white/40 border-white/10'}`}>
                    {docTag}
                  </span>
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No files found</p>
          )}
        </div>
      </div>

      {/* Panel 2 — Document Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedDoc ? (
          <>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <FileText size={16} className="text-teal-400" />
              <span className="text-sm font-medium text-white">{selectedDoc.filename}</span>
              {(() => {
                const t = getDocTag(selectedDoc)
                return (
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${tagColor[t] ?? 'bg-white/10 text-white/40 border-white/10'}`}>
                    {t}
                  </span>
                )
              })()}
              {selectedDoc.word_count && (
                <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{selectedDoc.word_count} words</span>
              )}
            </div>
            <div className="prose prose-invert max-w-none">
              {renderMarkdown(selectedDoc.content || '')}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p style={{ color: 'var(--text-muted)' }}>Select a document</p>
          </div>
        )}
      </div>
    </div>
  )
}
