'use client'

import { useState } from 'react'
import { Search, Brain, FileText, Calendar } from 'lucide-react'

interface MemoryEntry {
  id: string
  date: string
  size: string
  words: number
  content: string
}

const entries: MemoryEntry[] = [
  {
    id: '1',
    date: 'Thu, Mar 20',
    size: '3.3 KB',
    words: 772,
    content: '# Thursday, March 20\n\n## Qwen 3.5 Medium Research\n\nResearched new Qwen model release. Key findings: significant improvement in reasoning tasks, 70% of GPT-4o cost, strong multilingual support.\n\nBenchmarks vs competitors:\n- MMLU: 85.2 (Qwen) vs 83.1 (GPT-4o-mini)\n- HumanEval: 76% vs 71%\n- Cost: $0.14/M tokens vs $0.20/M tokens\n\n## Mission Control Planning\n\nDiscussed new page designs with Awais. Phase 2+3 scope finalized:\n- Content pipeline Kanban\n- Approvals workflow\n- Projects tracker\n- Team org chart\n- People CRM\n- Docs browser\n- Memory upgrade\n- Council (multi-model)\n\n## Agent Updates\n\nCharlie completed Railway deploy without intervention — first fully autonomous deployment. Scout flagged 3 trending topics for content pipeline.'
  },
  {
    id: '2',
    date: 'Wed, Mar 19',
    size: '2.1 KB',
    words: 498,
    content: '# Wednesday, March 19\n\n## Agent Coordination Improvement\n\nImplemented better handoff protocol between Henry and Charlie. No more duplicate task assignments.\n\nKey change: Henry now writes explicit delegation notes in the task title, not just the body.\n\n## Supabase Integration\n\nStarted planning database schema for Mission Control:\n- agents table\n- tasks table\n- approvals table\n- content_items table\n- memory_entries table\n\n## Notes\n\n- OpenAI o3 benchmarks leaked — impressive on math but expensive\n- Consider switching Scout to Gemini Flash for cost savings'
  },
  {
    id: '3',
    date: 'Tue, Mar 18',
    size: '4.7 KB',
    words: 1102,
    content: '# Tuesday, March 18\n\n## Architecture Discussion\n\nDecided to use file system as database for now. Simple, fast, no infra needed. Perfect is the enemy of done.\n\nDecision tree:\n- Current scale: file system ✓\n- 100+ daily entries: SQLite\n- Multi-agent concurrent writes: Supabase\n\n## Mission Control Phase 1 Launch\n\nLaunched to Railway. Initial pages:\n- Dashboard\n- Agents\n- Tasks\n- Memory (v1)\n- Activity\n- Costs\n\n## Awais Notes\n\n- Wants dark theme throughout, no light mode by default\n- Teal as primary accent color\n- Cards with subtle borders, not heavy shadows\n- "Like Linear but for AI agents"\n\n## Agent Performance Review\n\nScout: 9/10 — great trend signals this week\nQuill: 8/10 — newsletter draft needed 2 revisions\nCharlie: 10/10 — flawless infra week\nCodex: 7/10 — one failed PR, good recovery\nHenry: 9/10 — coordination improving'
  },
]

const groups = [
  { label: 'This Week', ids: ['1', '2', '3'] },
  { label: 'Last Week', ids: [] },
  { label: 'February 2026', ids: [] },
]

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

export default function MemoryPage() {
  const [selected, setSelected] = useState(entries[0].id)
  const [search, setSearch] = useState('')

  const selectedEntry = entries.find(e => e.id === selected)

  const filtered = entries.filter(e =>
    !search || e.date.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Column */}
      <div className="w-72 flex flex-col border-r border-white/10" style={{ background: 'var(--bg-secondary)' }}>
        {/* Long-term memory card */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-teal-400" />
            <span className="text-sm font-semibold text-white">Long-Term Memory</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2 bg-white/5 text-center">
              <p className="text-lg font-bold text-teal-400">47</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>journal entries</p>
            </div>
            <div className="rounded-lg p-2 bg-white/5 text-center">
              <p className="text-lg font-bold text-purple-400">128K</p>
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
          {groups.map(group => {
            const groupEntries = filtered.filter(e => group.ids.includes(e.id))
            if (groupEntries.length === 0 && group.ids.length > 0) return null
            if (group.ids.length === 0) return (
              <div key={group.label} className="px-3 py-2">
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{group.label}</p>
                <p className="text-xs px-2 py-1" style={{ color: 'var(--text-muted)' }}>No entries</p>
              </div>
            )
            return (
              <div key={group.label} className="mb-2">
                <p className="text-[10px] uppercase tracking-widest font-semibold px-3 py-2" style={{ color: 'var(--text-muted)' }}>{group.label}</p>
                {groupEntries.map(entry => (
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
                      <p className={`text-sm font-medium ${selected === entry.id ? 'text-teal-300' : 'text-white'}`}>
                        {entry.date}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {entry.size} · {entry.words.toLocaleString()} words
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Column — Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedEntry ? (
          <>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <FileText size={16} className="text-teal-400" />
              <div>
                <p className="text-sm font-medium text-white">{selectedEntry.date}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedEntry.size} · {selectedEntry.words.toLocaleString()} words</p>
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
