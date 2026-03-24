'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, User, Clock, Zap } from 'lucide-react'

interface Project {
  id: string
  name: string
  status: 'active' | 'planning' | 'running'
  description: string
  progress: number
  assignee: string
  priority: 'high' | 'medium' | 'low'
  updatedAt: string
}

const projects: Project[] = [
  { id: '1', name: 'Agent Org Infrastructure', status: 'active', description: 'Building out multi-agent orchestration layer with proper routing', progress: 80, assignee: 'Charlie', priority: 'high', updatedAt: '2 days ago' },
  { id: '2', name: 'Mission Control', status: 'active', description: 'Custom dashboard for managing OpenClaw agents', progress: 65, assignee: 'Henry', priority: 'high', updatedAt: '1 day ago' },
  { id: '3', name: 'Skool AI Extension', status: 'planning', description: 'AI-powered features for Vibe Coding Academy', progress: 15, assignee: 'Henry', priority: 'medium', updatedAt: '8 days ago' },
  { id: '4', name: 'Micro-SaaS Factory', status: 'planning', description: 'Automated pipeline for building and launching micro-SaaS products', progress: 5, assignee: 'Violet', priority: 'medium', updatedAt: '12 days ago' },
  { id: '5', name: 'Voice Clone System', status: 'running', description: 'LoRA-trained voice model for content generation', progress: 90, assignee: 'Codex', priority: 'high', updatedAt: '3 hours ago' },
]

const mockTasks: Record<string, string[]> = {
  '1': ['Set up agent routing layer', 'Configure message queues', 'Document orchestration patterns', 'Test multi-agent handoff'],
  '2': ['Build content pipeline page', 'Add approval workflow', 'Integrate Supabase', 'Deploy to Railway'],
  '3': ['Define feature scope', 'Research Skool API', 'Draft extension spec'],
  '4': ['Research micro-SaaS niches', 'Design automation pipeline', 'Create MVP template'],
  '5': ['Collect voice training data', 'Fine-tune LoRA weights', 'Integrate with content pipeline', 'Quality testing'],
}

const statusConfig = {
  active: { label: 'Active', className: 'bg-green-500/20 text-green-300 border-green-500/30' },
  planning: { label: 'Planning', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  running: { label: 'Running', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
}

const priorityConfig = {
  high: { label: 'High', className: 'text-red-400' },
  medium: { label: 'Medium', className: 'text-orange-400' },
  low: { label: 'Low', className: 'text-green-400' },
}

export default function ProjectsPage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const active = projects.filter(p => p.status === 'active').length
  const planning = projects.filter(p => p.status === 'planning').length
  const running = projects.filter(p => p.status === 'running').length

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {projects.length} total · {active} active · {planning} planning · {running} running
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map(project => {
          const isExpanded = expanded === project.id
          const status = statusConfig[project.status]
          const priority = priorityConfig[project.priority]

          return (
            <div
              key={project.id}
              className="rounded-lg border border-white/10 hover:border-teal-500/30 transition-colors cursor-pointer"
              style={{ background: 'var(--bg-secondary)' }}
              onClick={() => setExpanded(isExpanded ? null : project.id)}
            >
              <div className="p-5">
                {/* Status + Priority */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${status.className}`}>
                    {status.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <Zap size={11} className={priority.className} />
                    <span className={`text-xs ${priority.className}`}>{priority.label}</span>
                  </div>
                </div>

                {/* Name + Description */}
                <h3 className="text-base font-semibold text-white mb-1">{project.name}</h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span className="text-xs font-medium text-teal-400">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-teal-500 transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <span className="text-[10px] text-teal-300 font-bold">{project.assignee[0]}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.assignee}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.updatedAt}</span>
                    {isExpanded ? <ChevronUp size={14} className="text-teal-400" /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                </div>
              </div>

              {/* Expanded tasks */}
              {isExpanded && (
                <div className="border-t border-white/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Linked Tasks</p>
                  <ul className="space-y-2">
                    {(mockTasks[project.id] ?? []).map((task, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500/60" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
