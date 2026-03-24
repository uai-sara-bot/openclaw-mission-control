'use client'

import { useState } from 'react'
import {
  Brain, FolderTree, FileText, Search, ChevronRight, ChevronDown,
  Bot, Eye, Pencil, Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MemoryFile {
  id: string
  name: string
  agent: string
  type: 'episodic' | 'semantic' | 'procedural'
  size: string
  modified: string
  content: string
}

const sampleFiles: MemoryFile[] = [
  { id: '1', name: 'user-preferences.md', agent: 'main', type: 'semantic', size: '2.4 KB', modified: '2026-03-23T12:00:00Z', content: '# User Preferences\n\n- Prefers concise responses\n- Dark mode always\n- Communication style: direct, minimal\n- Timezone: UTC+1\n- Preferred models: Claude Opus for complex tasks, Sonnet for routine' },
  { id: '2', name: 'project-context.md', agent: 'main', type: 'semantic', size: '5.1 KB', modified: '2026-03-23T10:30:00Z', content: '# Project Context\n\n## OpenClaw\nAI agent orchestration platform.\n\n## Current Sprint\n- Mission Control dashboard\n- Gateway WebSocket stability\n- Cost optimization for multi-model routing\n\n## Key Decisions\n- Next.js 15 for frontend\n- Supabase for persistence\n- Railway for deployment' },
  { id: '3', name: 'api-patterns.md', agent: 'engage-dev', type: 'procedural', size: '3.8 KB', modified: '2026-03-22T16:20:00Z', content: '# API Patterns\n\n## REST Endpoints\n- Use kebab-case for URLs\n- Always return { data, error, meta }\n- Paginate with cursor-based pagination\n\n## Error Handling\n- 4xx: client errors with descriptive messages\n- 5xx: generic message, log details server-side' },
  { id: '4', name: 'expense-rules.md', agent: 'finance', type: 'procedural', size: '1.9 KB', modified: '2026-03-22T09:15:00Z', content: '# Expense Rules\n\n- API costs > $50/day: alert immediately\n- Monthly budget: $3,000 for AI APIs\n- Categorize: infra, AI-api, SaaS, misc\n- Report weekly on Mondays' },
  { id: '5', name: 'recent-conversations.md', agent: 'main', type: 'episodic', size: '8.2 KB', modified: '2026-03-23T14:30:00Z', content: '# Recent Conversations\n\n## 2026-03-23 14:30\nUser asked about deploying Mission Control to Railway.\nAdvised using Docker build with multi-stage Dockerfile.\n\n## 2026-03-23 11:00\nReviewed Q1 metrics. Total spend: $6,720.\nCreated follow-up task for cost optimization.' },
  { id: '6', name: 'research-notes.md', agent: 'research', type: 'episodic', size: '6.5 KB', modified: '2026-03-23T11:15:00Z', content: '# Research Notes\n\n## Vector DB Evaluation\n- Pinecone: managed, easy setup, $70/mo\n- Qdrant: self-hosted, performant, free\n- Weaviate: hybrid search, good docs\n\nRecommendation: Qdrant for cost, Pinecone for speed-to-market' },
  { id: '7', name: 'whatsapp-contacts.md', agent: 'whatsapp-cli', type: 'semantic', size: '1.2 KB', modified: '2026-03-21T08:00:00Z', content: '# WhatsApp Contacts\n\n- Alex (dev lead): +1-555-0101\n- Sara (PM): +1-555-0102\n- Finance bot group: "OpenClaw Finance"\n- Status updates group: "OC Status"' },
  { id: '8', name: 'code-style.md', agent: 'engage-dev', type: 'procedural', size: '2.1 KB', modified: '2026-03-20T14:00:00Z', content: '# Code Style\n\n- TypeScript strict mode\n- Functional components only\n- Tailwind for styling, no CSS modules\n- Zustand for state management\n- Prefer named exports' },
]

const agents = [...new Set(sampleFiles.map(f => f.agent))].sort()
const typeConfig = {
  episodic: { label: 'Episodic', color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
  semantic: { label: 'Semantic', color: 'text-[var(--accent-purple)]', bg: 'bg-[var(--accent-purple)]/10' },
  procedural: { label: 'Procedural', color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10' },
}

export default function MemoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [agentFilter, setAgentFilter] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<MemoryFile | null>(sampleFiles[0])
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set(agents))

  const filtered = sampleFiles.filter(f => {
    if (agentFilter && f.agent !== agentFilter) return false
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase()) && !f.content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const groupedByAgent = agents.reduce<Record<string, MemoryFile[]>>((acc, agent) => {
    const files = filtered.filter(f => f.agent === agent)
    if (files.length > 0) acc[agent] = files
    return acc
  }, {})

  const toggleAgent = (agent: string) => {
    setExpandedAgents(prev => {
      const next = new Set(prev)
      if (next.has(agent)) next.delete(agent)
      else next.add(agent)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Memory Browser</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">View and manage agent memory files</p>
      </div>

      {/* Agent filter */}
      <div className="flex items-center gap-2">
        <Bot size={14} className="text-[var(--text-muted)]" />
        <span className="text-xs text-[var(--text-muted)]">Agent:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setAgentFilter(null)}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs transition-colors',
              agentFilter === null
                ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            All
          </button>
          {agents.map(agent => (
            <button
              key={agent}
              onClick={() => setAgentFilter(agentFilter === agent ? null : agent)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs transition-colors',
                agentFilter === agent
                  ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {agent}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-4" style={{ minHeight: '60vh' }}>
        {/* File Tree Sidebar */}
        <div className="w-72 shrink-0 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden flex flex-col">
          <div className="p-3 border-b border-[var(--border)]">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {Object.entries(groupedByAgent).map(([agent, files]) => (
              <div key={agent}>
                <button
                  onClick={() => toggleAgent(agent)}
                  className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md hover:bg-white/5 transition-colors"
                >
                  {expandedAgents.has(agent) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  <FolderTree size={12} className="text-[var(--accent-orange)]" />
                  <span className="font-medium">{agent}</span>
                  <span className="ml-auto text-[var(--text-muted)]">{files.length}</span>
                </button>
                {expandedAgents.has(agent) && (
                  <div className="ml-4 space-y-0.5">
                    {files.map(file => (
                      <button
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className={cn(
                          'flex items-center gap-1.5 w-full px-2 py-1.5 text-xs rounded-md transition-colors',
                          selectedFile?.id === file.id
                            ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                        )}
                      >
                        <FileText size={12} />
                        <span className="truncate">{file.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {Object.keys(groupedByAgent).length === 0 && (
              <p className="text-xs text-[var(--text-muted)] text-center py-4">No files match your search.</p>
            )}
          </div>
          <div className="p-3 border-t border-[var(--border)]">
            <p className="text-[10px] text-[var(--text-muted)]">{filtered.length} files · {agents.length} agents</p>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden flex flex-col">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', typeConfig[selectedFile.type].bg)}>
                    <Brain size={16} className={typeConfig[selectedFile.type].color} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">{selectedFile.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', typeConfig[selectedFile.type].bg, typeConfig[selectedFile.type].color)}>
                        {typeConfig[selectedFile.type].label}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">{selectedFile.agent}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">·</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{selectedFile.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toast('Coming soon')} aria-label="View file" className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => toast('Coming soon')} aria-label="Edit file" className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => toast('Coming soon')} aria-label="Delete file" className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <pre className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-mono leading-relaxed">
                  {selectedFile.content}
                </pre>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Brain size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
                <p className="text-sm text-[var(--text-muted)]">Select a file to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
