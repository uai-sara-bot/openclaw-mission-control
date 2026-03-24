'use client'

import { useState, useEffect } from 'react'
import { Video, FileText, Twitter, ChevronRight, Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Stage = 'ideas' | 'scripting' | 'thumbnail' | 'filming' | 'editing' | 'published'

interface ContentItem {
  id: string
  title: string
  stage: Stage
  assignee: string
  content_type: string
  tag: string
  notes: string | null
  created_at: string
  updated_at: string
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

const typeIcon = (type: string) => {
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
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', content_type: 'video', tag: '', assignee: '', stage: 'ideas' as Stage })

  useEffect(() => {
    supabase.from('content_items').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setItems(data)
        setLoading(false)
      })

    const sub = supabase.channel('content-items-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, (payload) => {
        if (payload.eventType === 'INSERT') setItems(prev => [payload.new as ContentItem, ...prev])
        if (payload.eventType === 'UPDATE') setItems(prev => prev.map(i => i.id === payload.new.id ? payload.new as ContentItem : i))
        if (payload.eventType === 'DELETE') setItems(prev => prev.filter(i => i.id !== (payload.old as ContentItem).id))
      }).subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const moveToNext = async (item: ContentItem) => {
    const idx = STAGE_ORDER.indexOf(item.stage)
    if (idx >= STAGE_ORDER.length - 1) return
    const nextStage = STAGE_ORDER[idx + 1]
    await supabase.from('content_items').update({ stage: nextStage, updated_at: new Date().toISOString() }).eq('id', item.id)
  }

  const handleAddItem = async () => {
    if (!newItem.title) return
    await supabase.from('content_items').insert({
      title: newItem.title,
      content_type: newItem.content_type,
      tag: newItem.tag || 'general',
      assignee: newItem.assignee || 'Unassigned',
      stage: newItem.stage,
      notes: null,
    })
    setNewItem({ title: '', content_type: 'video', tag: '', assignee: '', stage: 'ideas' })
    setShowModal(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-teal-400">Loading...</div>

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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          New Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg mb-2">No content items yet</p>
          <p className="text-sm">Ask your agents to create content, or add items manually.</p>
        </div>
      ) : (
        /* Kanban Board */
        <div className="grid grid-cols-6 gap-3 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageItems = items.filter(i => i.stage === stage.key)
            return (
              <div key={stage.key} className="min-w-[180px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {stage.label}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                    {stageItems.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {stageItems.map(item => (
                    <div
                      key={item.id}
                      className="rounded-lg p-3 border border-white/10 hover:border-teal-500/50 transition-colors"
                      style={{ background: 'var(--bg-secondary)' }}
                    >
                      <div className="flex items-start gap-1.5 mb-2">
                        {typeIcon(item.content_type)}
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
                            <span className="text-[9px] text-teal-300 font-bold">{(item.assignee || '?')[0]}</span>
                          </div>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.assignee}</span>
                        </div>
                      </div>

                      {item.stage !== 'published' && (
                        <button
                          onClick={() => moveToNext(item)}
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
      )}

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div
            className="rounded-xl border border-white/10 p-6 w-full max-w-md"
            style={{ background: 'var(--bg-secondary)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Add Content Item</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white/80"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Title</label>
                <input type="text" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                  placeholder="Content title" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Type</label>
                <select value={newItem.content_type} onChange={e => setNewItem(p => ({ ...p, content_type: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500/50">
                  <option value="video">Video</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="tweet">Tweet</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Tag</label>
                <input type="text" value={newItem.tag} onChange={e => setNewItem(p => ({ ...p, tag: e.target.value }))}
                  placeholder="e.g. tutorial, review" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Assignee</label>
                <input type="text" value={newItem.assignee} onChange={e => setNewItem(p => ({ ...p, assignee: e.target.value }))}
                  placeholder="Agent name" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Stage</label>
                <select value={newItem.stage} onChange={e => setNewItem(p => ({ ...p, stage: e.target.value as Stage }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500/50">
                  {STAGE_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:border-white/20 transition-colors">Cancel</button>
              <button onClick={handleAddItem} className="flex-1 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium transition-colors">Add Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
