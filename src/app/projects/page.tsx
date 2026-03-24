'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Clock, Zap, Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Project {
  id: string
  name: string
  status: 'active' | 'planning' | 'running'
  description: string
  progress: number
  assignee: string
  priority: 'high' | 'medium' | 'low'
  updated_at: string
  created_at: string
}

interface Task {
  id: string
  title: string
  status: string
  project_tag: string
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

function timeAgo(dateStr: string) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({})
  const [loadingTasks, setLoadingTasks] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'planning' as Project['status'], priority: 'medium' as Project['priority'], assignee: '' })

  useEffect(() => {
    supabase.from('projects').select('*').order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProjects(data)
        setLoading(false)
      })

    const sub = supabase.channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
        if (payload.eventType === 'INSERT') setProjects(prev => [payload.new as Project, ...prev])
        if (payload.eventType === 'UPDATE') setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new as Project : p))
        if (payload.eventType === 'DELETE') setProjects(prev => prev.filter(p => p.id !== (payload.old as Project).id))
      }).subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const handleExpand = async (project: Project) => {
    if (expanded === project.id) {
      setExpanded(null)
      return
    }
    setExpanded(project.id)
    if (!projectTasks[project.id]) {
      setLoadingTasks(project.id)
      const { data } = await supabase.from('tasks').select('*').eq('project_tag', project.name)
      setProjectTasks(prev => ({ ...prev, [project.id]: data || [] }))
      setLoadingTasks(null)
    }
  }

  const handleAddProject = async () => {
    if (!newProject.name) return
    await supabase.from('projects').insert({
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      priority: newProject.priority,
      assignee: newProject.assignee || 'Unassigned',
      progress: 0,
    })
    setNewProject({ name: '', description: '', status: 'planning', priority: 'medium', assignee: '' })
    setShowModal(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-teal-400">Loading...</div>

  const active = projects.filter(p => p.status === 'active').length
  const planning = projects.filter(p => p.status === 'planning').length
  const running = projects.filter(p => p.status === 'running').length

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {projects.length} total · {active} active · {planning} planning · {running} running
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg mb-2">No projects yet</p>
          <p className="text-sm">Add your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(project => {
            const isExpanded = expanded === project.id
            const status = statusConfig[project.status] ?? statusConfig.planning
            const priority = priorityConfig[project.priority] ?? priorityConfig.medium
            const tasks = projectTasks[project.id] || []

            return (
              <div
                key={project.id}
                className="rounded-lg border border-white/10 hover:border-teal-500/30 transition-colors cursor-pointer"
                style={{ background: 'var(--bg-secondary)' }}
                onClick={() => handleExpand(project)}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${status.className}`}>
                      {status.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <Zap size={11} className={priority.className} />
                      <span className={`text-xs ${priority.className}`}>{priority.label}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-1">{project.name}</h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {project.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Progress</span>
                      <span className="text-xs font-medium text-teal-400">{project.progress ?? 0}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div
                        className="h-1.5 rounded-full bg-teal-500 transition-all"
                        style={{ width: `${project.progress ?? 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                        <span className="text-[10px] text-teal-300 font-bold">{(project.assignee || '?')[0]}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(project.updated_at)}</span>
                      {isExpanded ? <ChevronUp size={14} className="text-teal-400" /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/10 px-5 py-4">
                    <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Linked Tasks</p>
                    {loadingTasks === project.id ? (
                      <p className="text-xs text-teal-400">Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tasks linked to this project.</p>
                    ) : (
                      <ul className="space-y-2">
                        {tasks.map(task => (
                          <li key={task.id} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500/60" />
                            {task.title}
                            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{task.status}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div
            className="rounded-xl border border-white/10 p-6 w-full max-w-md"
            style={{ background: 'var(--bg-secondary)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">New Project</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white/80"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Name</label>
                <input type="text" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                  placeholder="Project name" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Description</label>
                <input type="text" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                  placeholder="What's this project about?" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Status</label>
                  <select value={newProject.status} onChange={e => setNewProject(p => ({ ...p, status: e.target.value as Project['status'] }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500/50">
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="running">Running</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Priority</label>
                  <select value={newProject.priority} onChange={e => setNewProject(p => ({ ...p, priority: e.target.value as Project['priority'] }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-teal-500/50">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider mb-1 block" style={{ color: 'var(--text-muted)' }}>Assignee</label>
                <input type="text" value={newProject.assignee} onChange={e => setNewProject(p => ({ ...p, assignee: e.target.value }))}
                  placeholder="Agent or person name" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:border-white/20 transition-colors">Cancel</button>
              <button onClick={handleAddProject} className="flex-1 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-white text-sm font-medium transition-colors">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
