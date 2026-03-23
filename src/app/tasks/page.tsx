import type { Metadata } from 'next'
import { Task } from '@/types'
import { CircleDot, Clock, AlertTriangle, ArrowUp, ArrowRight, ArrowDown, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Task Board',
}

const tasks: Task[] = [
  { id: '1', title: 'Review ENGAGE project architecture', description: 'Evaluate current architecture and suggest improvements', status: 'inbox', priority: 'high', assigned_to: null, created_by: 'user', due_date: '2026-03-25', created_at: '2026-03-22T10:00:00Z', updated_at: '2026-03-22T10:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '2', title: 'Research competitor pricing models', description: 'Gather pricing data from top 5 competitors', status: 'inbox', priority: 'medium', assigned_to: null, created_by: 'user', due_date: '2026-03-28', created_at: '2026-03-22T11:00:00Z', updated_at: '2026-03-22T11:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '3', title: 'Set up WhatsApp notification flow', description: 'Configure whatsapp-cli agent to forward urgent alerts', status: 'assigned', priority: 'high', assigned_to: 'whatsapp-cli', created_by: 'user', due_date: '2026-03-24', created_at: '2026-03-21T09:00:00Z', updated_at: '2026-03-22T14:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '4', title: 'Generate monthly finance report', description: 'Compile token costs, API spend, and ROI analysis for March', status: 'assigned', priority: 'medium', assigned_to: 'finance', created_by: 'user', due_date: '2026-03-31', created_at: '2026-03-20T08:00:00Z', updated_at: '2026-03-22T09:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '5', title: 'Benchmark GPT-5.4 vs Claude Opus', description: 'Run comparison on 50 standard prompts and compile results', status: 'in_progress', priority: 'high', assigned_to: 'compare-llms', created_by: 'user', due_date: '2026-03-26', created_at: '2026-03-21T10:00:00Z', updated_at: '2026-03-23T08:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '6', title: 'Scrape latest AI policy papers', description: 'Collect and summarize recent AI governance publications', status: 'in_progress', priority: 'low', assigned_to: 'research', created_by: 'user', due_date: '2026-03-27', created_at: '2026-03-19T15:00:00Z', updated_at: '2026-03-23T07:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '7', title: 'Draft blog post on agent orchestration', description: 'Write a technical blog post about multi-agent patterns', status: 'in_progress', priority: 'medium', assigned_to: 'main', created_by: 'user', due_date: '2026-03-25', created_at: '2026-03-20T12:00:00Z', updated_at: '2026-03-23T06:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '8', title: 'Fix memory retrieval latency', description: 'Investigate and fix slow memory lookups in the main agent', status: 'review', priority: 'critical', assigned_to: 'main', created_by: 'main', due_date: '2026-03-23', created_at: '2026-03-18T10:00:00Z', updated_at: '2026-03-22T18:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '9', title: 'Validate Qwen chat output quality', description: 'Review sample outputs for accuracy and tone', status: 'review', priority: 'medium', assigned_to: 'qwen-chat', created_by: 'user', due_date: '2026-03-24', created_at: '2026-03-19T14:00:00Z', updated_at: '2026-03-22T16:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '10', title: 'Configure Gemini API credentials', description: 'Set up and validate Gemini API access', status: 'done', priority: 'high', assigned_to: 'gemini-chat', created_by: 'user', due_date: '2026-03-20', created_at: '2026-03-17T09:00:00Z', updated_at: '2026-03-20T11:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '11', title: 'Create agent onboarding checklist', description: 'Document steps for adding a new agent to the fleet', status: 'done', priority: 'low', assigned_to: 'main', created_by: 'user', due_date: '2026-03-21', created_at: '2026-03-16T10:00:00Z', updated_at: '2026-03-21T09:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
  { id: '12', title: 'Audit token usage anomalies', description: 'Investigate unexpected spikes in token consumption', status: 'inbox', priority: 'critical', assigned_to: null, created_by: 'finance', due_date: '2026-03-24', created_at: '2026-03-23T06:00:00Z', updated_at: '2026-03-23T06:00:00Z', tags: [], project: null, subtasks: [], comments: [] },
]

const columns: { key: Task['status']; label: string; accent: string }[] = [
  { key: 'inbox', label: 'Inbox', accent: 'var(--accent-blue)' },
  { key: 'assigned', label: 'Assigned', accent: 'var(--accent-purple)' },
  { key: 'in_progress', label: 'In Progress', accent: 'var(--accent-orange)' },
  { key: 'review', label: 'Review', accent: 'var(--accent-red)' },
  { key: 'done', label: 'Done', accent: 'var(--accent-green)' },
]

const priorityConfig = {
  critical: { color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10', icon: AlertTriangle },
  high: { color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10', icon: ArrowUp },
  medium: { color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10', icon: ArrowRight },
  low: { color: 'text-[var(--text-muted)]', bg: 'bg-white/5', icon: ArrowDown },
}

function TaskCard({ task }: { task: Task }) {
  const priority = priorityConfig[task.priority]
  const PriorityIcon = priority.icon

  return (
    <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border)] p-3 hover:border-[var(--text-muted)]/50 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-[var(--text-primary)] leading-tight group-hover:text-white transition-colors">
          {task.title}
        </h3>
        <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.color} ${priority.bg}`}>
          <PriorityIcon size={10} />
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        {task.assigned_to ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
            <User size={10} />
            {task.assigned_to}
          </span>
        ) : (
          <span className="text-[11px] text-[var(--text-muted)] italic">Unassigned</span>
        )}

        {task.due_date && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
            <Clock size={10} />
            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  )
}

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Task Board</h1>
        <span className="text-sm text-[var(--text-muted)]">{tasks.length} tasks</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 min-h-[calc(100vh-10rem)]">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key)
          return (
            <div key={col.key} className="flex flex-col">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <CircleDot size={14} style={{ color: col.accent }} />
                <span className="text-sm font-medium text-[var(--text-primary)]">{col.label}</span>
                <span className="ml-auto text-xs text-[var(--text-muted)] bg-white/5 px-1.5 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Card list */}
              <div className="flex-1 space-y-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-2 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-8">No tasks</p>
                ) : (
                  colTasks.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
