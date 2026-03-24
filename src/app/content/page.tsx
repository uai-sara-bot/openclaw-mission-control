'use client'

import { useState } from 'react'
import { Video, FileText, Twitter, Tag, ChevronRight, Plus } from 'lucide-react'

type Stage = 'ideas' | 'scripting' | 'thumbnail' | 'filming' | 'editing' | 'published'

interface ContentItem {
  id: string
  title: string
  stage: Stage
  assignee: string
  type: 'video' | 'newsletter' | 'tweet'
  tag: string
}

const STAGES: { key: Stage; label: string }[] = [
  { key: 'ideas', label: 'Ideas' },
  { key: 'scripting', label: 'Scripting' },
  { key: 'thumbnail', label: 'Thumbnail' },
  { key: 'filming', label: 'Filming' },
  { key: 'editing', label: 'Editing' },
  { key: 'published', label: 'Published' },
]

const STAGE_ORDER: Stage[] = ['ideas', 'scripting', 'thumbnail', 'filming', 'editing', 'published']

const initialItems: ContentItem[] = [
  { id: '1', title: 'Free AI Automation Playbook', stage: 'scripting', assignee: 'Quill', type: 'video', tag: 'tutorial' },
  { id: '2', title: 'Mission Control Launch Trailer', stage: 'thumbnail', assignee: 'Pixel', type: 'video', tag: 'promo' },
  { id: '3', title: 'OpenClaw vs Claude Code', stage: 'ideas', assignee: 'Scout', type: 'video', tag: 'comparison' },
  { id: '4', title: 'Weekly AI Newsletter #47', stage: 'editing', assignee: 'Quill', type: 'newsletter', tag: 'newsletter' },
  { id: '5', title: '5 OpenClaw Use Cases Thread', stage: 'filming', assignee: 'Echo', type: 'tweet', tag: 'social' },
  { id: '6', title: 'DGX Spark Review', stage: 'published', assignee: 'Henry', type: 'video', tag: 'review' },
]

const typeIcon = (type: ContentItem['type']) => {
  if (type === 'video') return <Video size={12} className="text-teal-400" />
  if (type === 'newsletter') return <FileText size={12} className="text-purple-400" />
  return <Twitter size={12} className="text-blue-400" />
}

const tagColor: Record<string, string> = {
  tutorial: 'bg-teal-500/20 text-teal-300',
  promo: 'bg-orange-500/20 text-orange-300',
  comparison: 'bg-blue-500/20 text-blue-300',
  newsletter: 'bg-purple-500/20 text-purple-300',
  social: 'bg-pink-500/20 text-pink-300',
  review: 'bg-green-500/20 text-green-300',
}

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>(initialItems)

  const moveToNext = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const idx = STAGE_ORDER.indexOf(item.stage)
      if (idx < STAGE_ORDER.length - 1) {
        return { ...item, stage: STAGE_ORDER[idx + 1] }
      }
      return item
    }))
  }

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Pipeline</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {items.length} items across {STAGES.length} stages
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium transition-colors">
          <Plus size={14} />
          New Item
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-6 gap-3 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageItems = items.filter(i => i.stage === stage.key)
          return (
            <div key={stage.key} className="min-w-[180px]">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {stage.label}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                  {stageItems.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {stageItems.map(item => (
                  <div
                    key={item.id}
                    className="rounded-lg p-3 border border-white/10 hover:border-teal-500/50 transition-colors"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    <div className="flex items-start gap-1.5 mb-2">
                      {typeIcon(item.type)}
                      <p className="text-sm text-white leading-snug">{item.title}</p>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${tagColor[item.tag] ?? 'bg-white/10 text-white/60'}`}>
                        {item.tag}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-teal-500/30 flex items-center justify-center">
                          <span className="text-[9px] text-teal-300 font-bold">{item.assignee[0]}</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.assignee}</span>
                      </div>
                    </div>

                    {item.stage !== 'published' && (
                      <button
                        onClick={() => moveToNext(item.id)}
                        className="mt-2 w-full flex items-center justify-center gap-1 text-xs py-1 rounded border border-teal-500/40 text-teal-400 hover:bg-teal-500/10 transition-colors"
                      >
                        Next stage <ChevronRight size={10} />
                      </button>
                    )}
                    {item.stage === 'published' && (
                      <div className="mt-2 w-full text-center text-xs py-1 rounded border border-green-500/30 text-green-400">
                        ✓ Published
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty state */}
                {stageItems.length === 0 && (
                  <div className="rounded-lg p-4 border border-dashed border-white/10 text-center">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Empty</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
