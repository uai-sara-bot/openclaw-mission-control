'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, X, Clock } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────
interface KanbanTask {
  id: string
  title: string
  description: string
  status: 'recurring' | 'backlog' | 'inprogress' | 'review' | 'done'
  assignee: 'Alex' | 'Henry' | 'All'
  tag: string
  tagColor: string
  timestamp: string
}

interface ActivityItem {
  agent: string
  agentColor: string
  action: string
  time: string
}

// ── Mock Data ──────────────────────────────────────────────
const initialTasks: KanbanTask[] = [
  { id: '1', title: 'Daily standup coordination', description: 'Coordinate async standups across all agent channels', status: 'recurring', assignee: 'Henry', tag: 'ops', tagColor: '#a855f7', timestamp: '2m ago' },
  { id: '2', title: 'Weekly metrics digest', description: 'Compile token usage, task throughput, and cost breakdown', status: 'recurring', assignee: 'Alex', tag: 'reports', tagColor: '#3b82f6', timestamp: '1h ago' },
  { id: '3', title: 'Review ENGAGE architecture', description: 'Evaluate current arch and suggest improvements for scalability', status: 'backlog', assignee: 'Henry', tag: 'infra', tagColor: '#f97316', timestamp: '3h ago' },
  { id: '4', title: 'Research competitor pricing', description: 'Gather pricing data from top 5 competitors and compile comparison', status: 'backlog', assignee: 'Alex', tag: 'research', tagColor: '#22c55e', timestamp: '5h ago' },
  { id: '5', title: 'SpacetimeDB server module', description: 'Build and test server-side module for real-time sync', status: 'inprogress', assignee: 'Henry', tag: 'dev', tagColor: '#3b82f6', timestamp: '10m ago' },
  { id: '6', title: 'Mission Control Phase 1 UI', description: 'Build kanban, agents grid, and new nav items', status: 'inprogress', assignee: 'Alex', tag: 'frontend', tagColor: '#06b6d4', timestamp: '30m ago' },
  { id: '7', title: 'Triage flaky tests in CI', description: 'Identify and fix intermittently failing tests in the pipeline', status: 'review', assignee: 'Henry', tag: 'qa', tagColor: '#f97316', timestamp: '1h ago' },
  { id: '8', title: 'Auth middleware refactor', description: 'Refactor JWT validation and session handling middleware', status: 'done', assignee: 'Alex', tag: 'dev', tagColor: '#3b82f6', timestamp: '2h ago' },
  { id: '9', title: 'Thumbnail batch generation', description: 'Generate 20 YouTube thumbnails using Flux2 LoRA model', status: 'done', assignee: 'Henry', tag: 'content', tagColor: '#ec4899', timestamp: '3h ago' },
]

const mockActivity: ActivityItem[] = [
  { agent: 'Henry', agentColor: '#a855f7', action: 'completed task: Weekly metrics digest', time: '2m ago' },
  { agent: 'Charlie', agentColor: '#3b82f6', action: 'pushed commit to SpacetimeDB module', time: '4m ago' },
  { agent: 'Ralph', agentColor: '#f97316', action: 'opened PR: fix flaky integration tests', time: '8m ago' },
  { agent: 'Scout', agentColor: '#22c55e', action: 'published competitor analysis report', time: '15m ago' },
  { agent: 'Quill', agentColor: '#ec4899', action: 'drafted video script for YT channel', time: '22m ago' },
  { agent: 'Henry', agentColor: '#a855f7', action: 'updated task: ENGAGE architecture review', time: '35m ago' },
  { agent: 'Echo', agentColor: '#06b6d4', action: 'scheduled 5 social posts for tomorrow', time: '41m ago' },
  { agent: 'Codex', agentColor: '#8b5cf6', action: 'merged auth middleware refactor', time: '52m ago' },
  { agent: 'Charlie', agentColor: '#3b82f6', action: 'created branch: feat/spacetime-sync', time: '1h ago' },
  { agent: 'Scout', agentColor: '#22c55e', action: 'flagged 3 competitor product launches', time: '1h ago' },
]

const COLUMNS: { key: KanbanTask['status']; label: string; color: string }[] = [
  { key: 'recurring', label: 'Recurring', color: '#a855f7' },
  { key: 'backlog', label: 'Backlog', color: '#6b7280' },
  { key: 'inprogress', label: 'In Progress', color: '#3b82f6' },
  { key: 'review', label: 'Review', color: '#f97316' },
  { key: 'done', label: 'Done', color: '#22c55e' },
]

// ── Task Card ──────────────────────────────────────────────
function TaskCard({ task, onClick }: { task: KanbanTask; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#111118] border border-white/10 rounded-lg p-3 cursor-pointer hover:border-white/20 transition-all hover:shadow-lg hover:shadow-black/30"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-white leading-tight line-clamp-2">{task.title}</h4>
        <span
          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
          style={{ backgroundColor: task.assignee === 'Alex' ? '#3b82f6' : '#a855f7' }}
        >
          {task.assignee[0]}
        </span>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      <div className="flex items-center justify-between">
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white/80"
          style={{ backgroundColor: task.tagColor + '33', border: `1px solid ${task.tagColor}44` }}
        >
          {task.tag}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <Clock size={10} />
          {task.timestamp}
        </span>
      </div>
    </div>
  )
}

// ── New Task Modal ────────────────────────────────────────
function NewTaskModal({ onClose, onSave }: { onClose: () => void; onSave: (task: KanbanTask) => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState<KanbanTask['assignee']>('All')
  const [status, setStatus] = useState<KanbanTask['status']>('backlog')
  const [tag, setTag] = useState('')

  function handleSave() {
    if (!title.trim()) { toast('Please enter a title'); return }
    onSave({
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim() || 'No description',
      assignee,
      status,
      tag: tag.trim() || 'general',
      tagColor: '#6b7280',
      timestamp: 'just now',
    })
    toast.success('Task created!')
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
              <select
                value={assignee}
                onChange={e => setAssignee(e.target.value as KanbanTask['assignee'])}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
              >
                <option value="Alex">Alex</option>
                <option value="Henry">Henry</option>
                <option value="All">All agents</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as KanbanTask['status'])}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500/50"
              >
                <option value="recurring">Recurring</option>
                <option value="backlog">Backlog</option>
                <option value="inprogress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tag</label>
            <input
              value={tag}
              onChange={e => setTag(e.target.value)}
              placeholder="e.g. dev, ops, research..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-teal-500/50"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-sm text-white font-medium transition-colors"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Task Detail Modal ─────────────────────────────────────
function TaskDetailModal({ task, onClose }: { task: KanbanTask; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#111118] border border-white/10 rounded-xl shadow-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white/80 mb-2 inline-block"
              style={{ backgroundColor: task.tagColor + '33', border: `1px solid ${task.tagColor}44` }}
            >
              {task.tag}
            </span>
            <h2 className="text-lg font-semibold text-white">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white flex-shrink-0">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4">{task.description}</p>
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
            <div className="text-xs text-gray-500 mb-1">Updated</div>
            <div className="text-white font-medium">{task.timestamp}</div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => { toast('Coming soon'); onClose() }} className="flex-1 py-2 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-sm text-teal-400 transition-colors">
            Edit Task
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────
export default function TasksPage() {
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks)
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null)

  const stats = [
    { label: 'Completed today', value: 47, color: '#22c55e' },
    { label: 'Agents active', value: '8/8', color: '#06b6d4' },
    { label: 'Throughput/hr', value: 124, color: '#3b82f6' },
    { label: 'Pipeline load', value: 6, color: '#f97316' },
  ]

  const filteredTasks = assigneeFilter
    ? tasks.filter(t => t.assignee === assigneeFilter)
    : tasks

  function handleAddTask(task: KanbanTask) {
    setTasks(prev => [...prev, task])
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 p-6 overflow-y-auto">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(stat => (
            <div key={stat.label} className="bg-[#111118] border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-sm text-white font-medium transition-colors"
          >
            <Plus size={14} />
            New Task
          </button>
          {['Alex', 'Henry'].map(name => (
            <button
              key={name}
              onClick={() => setAssigneeFilter(assigneeFilter === name ? null : name)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                assigneeFilter === name
                  ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
          <button
            onClick={() => setAssigneeFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              !assigneeFilter
                ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            All projects
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.key)
            return (
              <div key={col.key} className="flex-shrink-0 w-64">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="text-sm font-medium text-gray-300">{col.label}</span>
                  <span className="ml-auto text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center text-xs text-gray-600 py-6 border border-dashed border-white/5 rounded-lg">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Panel: Live Activity Feed */}
      <div className="w-72 flex-shrink-0 border-l border-white/10 bg-[#0a0a0f] flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Live Activity</h3>
          <p className="text-xs text-gray-500 mt-0.5">Real-time agent actions</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {mockActivity.map((item, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-semibold" style={{ color: item.agentColor }}>{item.agent}</span>
                <span className="ml-auto text-[10px] text-gray-600">{item.time}</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">{item.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showNewModal && (
        <NewTaskModal onClose={() => setShowNewModal(false)} onSave={handleAddTask} />
      )}
      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  )
}
