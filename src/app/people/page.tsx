'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, Plus, X, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Interaction {
  id: string
  person_id: string
  interaction_type: 'call' | 'email' | 'message'
  date: string
  summary: string
}

interface Person {
  id: string
  name: string
  initials: string
  role: string
  email: string
  tags: string[] | null
  bio: string | null
  category: string | null
  created_at: string
  people_interactions?: Interaction[]
}

const avatarColors = ['bg-teal-500/30 text-teal-300', 'bg-purple-500/30 text-purple-300', 'bg-blue-500/30 text-blue-300', 'bg-orange-500/30 text-orange-300']

const interactionIcon = (type: string) => {
  if (type === 'call') return <Phone size={12} />
  if (type === 'email') return <Mail size={12} />
  return <MessageSquare size={12} />
}

const roleColor: Record<string, string> = {
  'Collaborator': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Friend': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Professional Contact': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Agency': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'Content': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'External': 'bg-green-500/20 text-green-300 border-green-500/30',
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', role: '', email: '', bio: '', category: '' })

  const filters = ['All', 'Agency', 'Content', 'External']

  useEffect(() => {
    supabase.from('people').select('*, people_interactions(*)').order('name')
      .then(({ data }) => {
        if (data) {
          setPeople(data)
          if (data.length > 0) setSelected(data[0].id)
        }
        setLoading(false)
      })

    const sub = supabase.channel('people-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'people' }, () => {
        // Refetch to get interactions too
        supabase.from('people').select('*, people_interactions(*)').order('name')
          .then(({ data }) => { if (data) setPeople(data) })
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'people' }, () => {
        supabase.from('people').select('*, people_interactions(*)').order('name')
          .then(({ data }) => { if (data) setPeople(data) })
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'people' }, (payload) => {
        setPeople(prev => prev.filter(p => p.id !== (payload.old as Person).id))
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const handleAdd = async () => {
    if (!newContact.name) return
    const initials = newContact.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    await supabase.from('people').insert({
      name: newContact.name,
      initials,
      role: newContact.role || 'Contact',
      email: newContact.email,
      bio: newContact.bio,
      category: newContact.category || 'External',
      tags: [],
    })
    setNewContact({ name: '', role: '', email: '', bio: '', category: '' })
    setShowModal(false)
  }

  const filteredPeople = people.filter(p => {
    if (filter === 'All') return true
    return p.category === filter
  })

  const selectedPerson = people.find(p => p.id === selected) ?? null

  if (loading) return <div className="flex items-center justify-center h-64 text-teal-400">Loading...</div>

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel */}
      <div className="w-72 flex flex-col border-r border-white/10" style={{ background: 'var(--bg-secondary)' }}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">People</h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 transition-colors"
            >
              <Plus size={11} />
              Add
            </button>
          </div>
          <div className="flex gap-1 flex-wrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  filter === f ? 'bg-teal-500/20 text-teal-300' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredPeople.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-600">
              <p className="text-xs">No contacts yet</p>
            </div>
          ) : (
            filteredPeople.map((person, i) => (
              <button
                key={person.id}
                onClick={() => setSelected(person.id)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors border-b border-white/5 ${
                  selected === person.id ? 'bg-teal-500/10 border-l-2 border-l-teal-500' : 'hover:bg-white/5'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                  {person.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{person.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{person.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      {people.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <p className="text-lg mb-2">No contacts yet</p>
          <p className="text-sm">Add people you work with.</p>
        </div>
      ) : selectedPerson ? (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start gap-4 mb-6">
            {(() => {
              const idx = people.indexOf(selectedPerson)
              return (
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${avatarColors[idx % avatarColors.length]}`}>
                  {selectedPerson.initials}
                </div>
              )
            })()}
            <div>
              <h2 className="text-xl font-bold text-white">{selectedPerson.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColor[selectedPerson.role] ?? 'bg-white/10 text-white/60 border-white/20'}`}>
                {selectedPerson.role}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedPerson.email}</span>
              </div>
            </div>
          </div>

          {selectedPerson.tags && selectedPerson.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {selectedPerson.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {selectedPerson.bio && (
            <div className="rounded-lg p-4 border border-white/10 mb-5" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Bio</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedPerson.bio}</p>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Interaction History</p>
            {(!selectedPerson.people_interactions || selectedPerson.people_interactions.length === 0) ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No interactions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {selectedPerson.people_interactions.map((interaction, i) => (
                  <div key={interaction.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                        {interactionIcon(interaction.interaction_type)}
                      </div>
                      {i < (selectedPerson.people_interactions?.length ?? 0) - 1 && (
                        <div className="w-px flex-1 mt-1 bg-white/10" />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs text-teal-400 mb-0.5">{interaction.date} · {interaction.interaction_type}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{interaction.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: 'var(--text-muted)' }}>Select a contact</p>
        </div>
      )}

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div
            className="rounded-xl border border-white/10 p-6 w-full max-w-md"
            style={{ background: 'var(--bg-secondary)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Add New Contact</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white/80">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {(['name', 'role', 'email', 'bio'] as const).map(field => (
                <div key={field}>
                  <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>{field}</label>
                  <input
                    type="text"
                    value={newContact[field]}
                    onChange={e => setNewContact(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={field === 'name' ? 'Full name' : field}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Category</label>
                <select value={newContact.category} onChange={e => setNewContact(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500/50">
                  <option value="External">External</option>
                  <option value="Agency">Agency</option>
                  <option value="Content">Content</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:border-white/20 transition-colors">
                Cancel
              </button>
              <button onClick={handleAdd} className="flex-1 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium transition-colors">
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
