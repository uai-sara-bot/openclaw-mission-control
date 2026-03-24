'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  DndContext, DragEndEvent, DragOverlay, closestCenter,
  PointerSensor, useSensor, useSensors, DragStartEvent
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { Plus, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

// Types
interface Task {
  id: string
  run_id?: string
  title: string
  description?: string
  status: 'recurring' | 'backlog' | 'inprogress' | 'review' | 'done'
  assignee: string
  project_tag?: string
  tag_color?: string
  created_at: string
  updated_at?: string
  completed_at?: string
  source?: string
}

interface ActivityEvent {
  id: string
  agent_name: string
  action: string
  event_type: string
  created_at: string
}

// Sortable task card component
function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-[#1a1a24] border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-teal-500/30 transition-colors"
    >
      <h4 className="text-sm text-white font-medium mb-1 line-clamp-2">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        {task.project_tag && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: (task.tag_color || '#3b82f6') + '20',
              color: task.tag_color || '#3b82f6',
            }}
          >
            {task.project_tag}
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">{task.assignee}</span>
      </div>
    </div>
  )
}

// Droppable column wrapper
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 space-y-2 min-h-[100px] rounded-lg transition-colors ${isOver ? 'bg-teal-500/5' : ''}`}
    >
      {children}
    </div>
  )
}

const COLUMNS: { key: Task['status']; label: string; color: string }[] = [
  { key: 'recurring', label: 'Recurring', color: '#a855f7' },
  { key: 'backlog', label: 'Backlog', color: '#6b7280' },
  { key: 'inprogress', label: 'In Progress', color: '#3b82f6' },
  { key: 'review', label: 'Review', color: '#f97316' },
  { key: 'done', label: 'Done', color: '#22c55e' },
]

// New task modal
function NewTaskModal({ onClose, onSave }: { onClose: () => void; onSave: (t: Partial<Task>) => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState('Awais')
  const [status, setStatus] = useState<Task['status']>('backlog')
  const [tag, setTag] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim()) { toast('Please enter a title'); return }
    setSaving(true)
    await onSave({ title: title.trim(), description: description.trim(), assignee, status, project_tag: tag.trim() || undefined })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#111118] border border-white/10 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">New Task</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What needs to be done?"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Assignee</label>
              <input
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                placeholder="Assignee name..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Task['status'])}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
              >
                {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Project Tag</label>
            <input
              value={tag}
              onChange={e => setTag(e.target.value)}
              placeholder="e.g. dev, ops, research..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-sm text-white font-medium transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Task detail modal
function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#111118] border border-white/10 rounded-xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            {task.project_tag && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium mb-2 inline-block"
                style={{ background: (task.tag_color || '#3b82f6') + '20', color: task.tag_color || '#3b82f6' }}>
                {task.project_tag}
              </span>
            )}
            <h2 className="text-lg font-semibold text-white">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white flex-shrink-0">
            <X size={16} />
          </button>
        </div>
        {task.description && <p className="text-sm text-gray-400 mb-4">{task.description}</p>}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Assignee</div>
            <div className="text-white font-medium">{task.assignee}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className="text-white font-medium capitalize">{task.status}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Created</div>
            <div className="text-white font-medium">{new Date(task.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    async function fetchData() {
      const [{ data: taskData, error: taskError }, { data: activityData }] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('activity_events').select('*').order('created_at', { ascending: false }).limit(50),
      ])
      if (taskError) console.error('Tasks fetch error:', taskError)
      if (taskData) setTasks(taskData)
      if (activityData) setActivities(activityData)
      setLoading(false)
    }
    fetchData()

    // Real-time subscriptions
    const taskSub = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') setTasks(prev => [payload.new as Task, ...prev])
        if (payload.eventType === 'UPDATE') setTasks(prev => prev.map(t => t.id === (payload.new as Task).id ? payload.new as Task : t))
        if (payload.eventType === 'DELETE') setTasks(prev => prev.filter(t => t.id !== (payload.old as Task).id))
      })
      .subscribe()

    const activitySub = supabase
      .channel('activity-realtime-tasks')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_events' }, (payload) => {
        setActivities(prev => [payload.new as ActivityEvent, ...prev.slice(0, 49)])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(taskSub)
      supabase.removeChannel(activitySub)
    }
  }, [])

  function handleDragStart(event: DragStartEvent) {
    const found = tasks.find(t => t.id === event.active.id)
    setActiveTask(found || null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as string

    if (COLUMNS.some(c => c.key === newStatus)) {
      const task = tasks.find(t => t.id === taskId)
      if (!task || task.status === newStatus) return

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t))
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId)
      if (error) {
        console.error('Update error:', error)
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: task.status } : t))
        toast.error('Failed to update task status')
      }
    }
  }

  async function handleCreateTask(data: Partial<Task>) {
    const newTask = {
      title: data.title!,
      description: data.description,
      status: data.status || 'backlog',
      assignee: data.assignee || 'Awais',
      project_tag: data.project_tag,
      created_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('tasks').insert(newTask)
    if (error) {
      console.error('Insert error:', error)
      toast.error('Failed to create task')
    } else {
      toast.success('Task created!')
    }
  }

  const filteredTasks = filter ? tasks.filter(t => t.assignee === filter) : tasks
  const today = new Date().toISOString().split('T')[0]
  const completedToday = tasks.filter(t => t.status === 'done' && t.completed_at?.startsWith(today)).length
  const activeAgents = new Set(activities.slice(0, 20).map(a => a.agent_name)).size

  // Get unique assignees for filter buttons
  const assignees = [...new Set(tasks.map(t => t.assignee))].slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-teal-400 animate-pulse">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 p-6 overflow-hidden">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Completed today', value: completedToday, color: '#22c55e' },
            { label: 'Agents active', value: activeAgents, color: '#00d4aa' },
            { label: 'In progress', value: tasks.filter(t => t.status === 'inprogress').length, color: '#3b82f6' },
            { label: 'In review', value: tasks.filter(t => t.status === 'review').length, color: '#f97316' },
          ].map(s => (
            <div key={s.label} className="bg-[#111118] border border-white/10 rounded-lg p-3">
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + New Task */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            New Task
          </button>
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!filter ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-gray-400 hover:text-white bg-white/5'}`}
          >
            All
          </button>
          {assignees.map(a => (
            <button
              key={a}
              onClick={() => setFilter(filter === a ? null : a)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === a ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-gray-400 hover:text-white bg-white/5'}`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Kanban with DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
            {COLUMNS.map(col => {
              const colTasks = filteredTasks.filter(t => t.status === col.key)
              return (
                <div key={col.key} className="w-60 flex-shrink-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{col.label}</span>
                    <span className="text-xs text-gray-600 ml-auto bg-white/5 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                  <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <DroppableColumn id={col.key}>
                      {colTasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                      ))}
                      {colTasks.length === 0 && (
                        <div className="text-xs text-gray-600 text-center py-8 border border-dashed border-white/5 rounded-lg">
                          {tasks.length === 0 && col.key === 'backlog'
                            ? 'No tasks yet — agents will create tasks here automatically'
                            : 'Drop here'}
                        </div>
                      )}
                    </DroppableColumn>
                  </SortableContext>
                </div>
              )
            })}
          </div>
          <DragOverlay>
            {activeTask && (
              <div className="bg-[#1a1a24] border border-teal-500/50 rounded-lg p-3 shadow-xl shadow-black/50 rotate-1">
                <p className="text-sm text-white">{activeTask.title}</p>
                <p className="text-xs text-gray-400 mt-1">{activeTask.assignee}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Live Activity Feed */}
      <div className="w-72 flex-shrink-0 border-l border-white/10 bg-[#0a0a0f] flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Live Activity
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Real-time agent actions</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-gray-600">No recent activity.</p>
              <p className="text-xs text-gray-700 mt-1">Waiting for agents...</p>
            </div>
          ) : (
            activities.map(a => (
              <div key={a.id} className="p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-semibold text-teal-400">{a.agent_name}</span>
                  <span className="ml-auto text-[10px] text-gray-600">
                    {new Date(a.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{a.action}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {showNewModal && <NewTaskModal onClose={() => setShowNewModal(false)} onSave={handleCreateTask} />}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  )
}
