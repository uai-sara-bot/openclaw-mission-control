'use client'

import { useState } from 'react'
import { Mail, Phone, Plus, X, MessageSquare } from 'lucide-react'

interface Interaction {
  type: 'call' | 'email' | 'message'
  date: string
  summary: string
}

interface Contact {
  id: string
  name: string
  initials: string
  role: string
  email: string
  tags: string[]
  bio: string
  interactions: Interaction[]
}

const initialContacts: Contact[] = [
  {
    id: '1', name: 'Sarah Chen', initials: 'SC', role: 'Collaborator', email: 'sarah@example.com',
    tags: ['knowledge management', 'RAG'],
    bio: 'PhD in CS, working on semantic clustering for knowledge bases. Great insights on RAG architecture.',
    interactions: [
      { type: 'call', date: 'Mar 15', summary: 'Discussed RAG architecture for personal knowledge base' },
      { type: 'email', date: 'Mar 8', summary: 'Shared research paper on semantic clustering' },
    ]
  },
  {
    id: '2', name: 'Marcus Rivera', initials: 'MR', role: 'Friend', email: 'marcus@example.com',
    tags: ['startup', 'AI'],
    bio: 'Building AI startup in the fintech space. Met at SF conference.',
    interactions: [
      { type: 'call', date: 'Mar 20', summary: 'Catch-up, discussed AI in fintech trends' },
    ]
  },
  {
    id: '3', name: 'Dr. Emily Watson', initials: 'EW', role: 'Professional Contact', email: 'emily@example.com',
    tags: ['research', 'methodology'],
    bio: 'AI researcher focused on agent systems and evaluation frameworks.',
    interactions: [
      { type: 'email', date: 'Mar 18', summary: 'Intro email, interested in collaboration' },
    ]
  },
]

const avatarColors = ['bg-teal-500/30 text-teal-300', 'bg-purple-500/30 text-purple-300', 'bg-blue-500/30 text-blue-300', 'bg-orange-500/30 text-orange-300']

const interactionIcon = (type: Interaction['type']) => {
  if (type === 'call') return <Phone size={12} />
  if (type === 'email') return <Mail size={12} />
  return <MessageSquare size={12} />
}

const roleColor: Record<string, string> = {
  'Collaborator': 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'Friend': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Professional Contact': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

export default function PeoplePage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [selected, setSelected] = useState<string>(initialContacts[0].id)
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', role: '', email: '', bio: '' })

  const filters = ['All', 'Agency', 'Content', 'External']
  const selectedContact = contacts.find(c => c.id === selected)

  const handleAdd = () => {
    if (!newContact.name) return
    const contact: Contact = {
      id: String(Date.now()),
      name: newContact.name,
      initials: newContact.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      role: newContact.role || 'Contact',
      email: newContact.email,
      tags: [],
      bio: newContact.bio,
      interactions: [],
    }
    setContacts(prev => [...prev, contact])
    setSelected(contact.id)
    setNewContact({ name: '', role: '', email: '', bio: '' })
    setShowModal(false)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Panel */}
      <div className="w-72 flex flex-col border-r border-white/10" style={{ background: 'var(--bg-secondary)' }}>
        {/* Header */}
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
          {/* Filter tabs */}
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

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact, i) => (
            <button
              key={contact.id}
              onClick={() => setSelected(contact.id)}
              className={`w-full flex items-center gap-3 p-3 text-left transition-colors border-b border-white/5 ${
                selected === contact.id ? 'bg-teal-500/10 border-l-2 border-l-teal-500' : 'hover:bg-white/5'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                {contact.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{contact.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{contact.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      {selectedContact ? (
        <div className="flex-1 overflow-y-auto p-6">
          {/* Contact Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${avatarColors[contacts.indexOf(selectedContact) % avatarColors.length]}`}>
              {selectedContact.initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedContact.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColor[selectedContact.role] ?? 'bg-white/10 text-white/60 border-white/20'}`}>
                {selectedContact.role}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedContact.email}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {selectedContact.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                {tag}
              </span>
            ))}
          </div>

          {/* Bio */}
          <div className="rounded-lg p-4 border border-white/10 mb-5" style={{ background: 'var(--bg-secondary)' }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Bio</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedContact.bio}</p>
          </div>

          {/* Interaction History */}
          <div>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Interaction History</p>
            <div className="space-y-3">
              {selectedContact.interactions.map((interaction, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                      {interactionIcon(interaction.type)}
                    </div>
                    {i < selectedContact.interactions.length - 1 && (
                      <div className="w-px flex-1 mt-1 bg-white/10" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs text-teal-400 mb-0.5">{interaction.date} · {interaction.type}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{interaction.summary}</p>
                  </div>
                </div>
              ))}
            </div>
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
