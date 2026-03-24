'use client'

import { useState, useMemo } from 'react'
import { Search, FileText, Tag } from 'lucide-react'

interface Doc {
  id: string
  filename: string
  tag: string
  content: string
}

const docs: Doc[] = [
  { id: '1', filename: '2026-03-20-morning-brief.md', tag: 'journal', content: '# Morning Brief - March 20\n\n## Scout Top Finds\n\n- OpenAI pivoting to coding tools because Claude Code is dominating\n- Vibe coding heat signals from GitHub trending\n- New Qwen3 local model beating GPT-4o at 70% the cost\n\n## Action Items\n\n- Review Claude Code vs Codex comparison\n- Schedule weekly AI roundup\n- Follow up on DGX Spark benchmarks' },
  { id: '2', filename: 'newsletter-feb-25.md', tag: 'newsletter', content: '# Newsletter Draft — Feb 25, 2026\n\n**Subject Options:**\n1. "Vibe Coding Goes Mainstream..."\n2. "The NYT Just Validated What We Knew"\n\nHey there,\n\nThe New York Times ran a piece this week about vibe coding. We\'ve been writing about this for months.\n\nHere\'s what matters: the mainstream has caught up. That means the window for being early is closing.\n\n## What this means for you\n\nIf you\'re not using AI to write code yet, you\'re falling behind...' },
  { id: '3', filename: 'mission-control-prd.md', tag: 'docs', content: '# Mission Control PRD\n\n## Overview\nCustom dashboard for managing OpenClaw agents and workflows.\n\n## Goals\n- Single pane of glass for all agent activity\n- Approval workflow for sensitive agent actions\n- Content pipeline management\n- Memory and journal browsing\n\n## Tech Stack\n- Next.js 15 + TypeScript\n- Tailwind CSS\n- Supabase (database)\n- Railway (hosting)\n- Recharts (charts)' },
  { id: '4', filename: 'skool-ai-extension-plan.md', tag: 'docs', content: '# Skool AI Extension Plan\n\n## Goals\n- Integrate AI tutoring into course platform\n- Auto-generate quiz questions from content\n- Personalized learning paths\n\n## Phase 1\n- Browser extension for Skool\n- RAG over course materials\n- Q&A interface\n\n## Phase 2\n- Quiz generation\n- Progress tracking\n- AI tutor persona' },
  { id: '5', filename: '2026-03-18-wednesday.md', tag: 'journal', content: '# Wednesday March 18\n\n## Architecture Discussion\n\nDecided to use file system as database for now. Simple, fast, no infra needed.\n\nKey insight: perfect is the enemy of done. Ship a file-based system, upgrade to Supabase when we hit scale.\n\n## Agent Coordination\n\nHenry is getting better at delegating. Charlie handled the Railway deploy without intervention.\n\n## Tomorrow\n\n- Deploy Mission Control Phase 1\n- Brief Scout on new research priorities' },
]

const tags = ['all', 'journal', 'docs', 'newsletter', 'content', 'youtube', 'other']

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

export default function DocsPage() {
  const [selectedTag, setSelectedTag] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(docs[0].id)

  const filtered = useMemo(() => {
    return docs.filter(d => {
      const matchesTag = selectedTag === 'all' || d.tag === selectedTag
      const matchesSearch = !search || d.filename.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase())
      return matchesTag && matchesSearch
    })
  }, [selectedTag, search])

  const selectedDoc = docs.find(d => d.id === selectedId) ?? null

  const tagColor: Record<string, string> = {
    journal: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    newsletter: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    docs: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    content: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    youtube: 'bg-red-500/20 text-red-300 border-red-500/30',
    other: 'bg-white/10 text-white/60 border-white/20',
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Panel 1 — File Tree */}
      <div className="w-64 flex flex-col border-r border-white/10" style={{ background: 'var(--bg-secondary)' }}>
        <div className="p-3 border-b border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-white">Docs</p>
          {/* Search */}
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
            {tags.map(t => (
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
          {filtered.map(doc => (
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
                <span className={`text-[9px] px-1 py-0.5 rounded mt-1 inline-block border ${tagColor[doc.tag] ?? 'bg-white/10 text-white/40 border-white/10'}`}>
                  {doc.tag}
                </span>
              </div>
            </button>
          ))}
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
              <span className={`text-xs px-2 py-0.5 rounded-full border ${tagColor[selectedDoc.tag] ?? 'bg-white/10 text-white/40 border-white/10'}`}>
                {selectedDoc.tag}
              </span>
            </div>
            <div className="prose prose-invert max-w-none">
              {renderMarkdown(selectedDoc.content)}
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
