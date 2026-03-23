'use client'

import { useState, useMemo } from 'react'
import { Task } from '@/types'
import {
  CircleDot, Clock, AlertTriangle, ArrowUp, ArrowRight, ArrowDown,
  User, Search, Plus, X, LayoutGrid, List, Filter, ChevronDown,
  CheckSquare, Square, MessageSquare, Tag, FolderOpen,
  BarChart3, CheckCircle2, Timer, AlertCircle,
} from 'lucide-react'

// ─── Sample Data ───────────────────────────────────────────────
const PROJECTS = ['OpenClaw MC', 'ENGAGE', 'Personal Finance', 'Research'] as const
const AGENTS = ['main', 'personal', 'finance', 'engage-dev', 'research', 'openai-chat', 'gemini-chat', 'anthropic-chat', 'compare-llms', 'general-work', 'qwen-chat', 'sara-intimate', 'whatsapp-cli'] as const

const priorityOptions: Task['priority'][] = ['critical', 'high', 'medium', 'low']

const initialTasks: Task[] = [
  { id: '1', title: 'Review ENGAGE project architecture', description: 'Evaluate current architecture and suggest improvements for scalability', status: 'inbox', priority: 'high', assigned_to: null, created_by: 'user', due_date: '2026-03-25', created_at: '2026-03-22T10:00:00Z', updated_at: '2026-03-22T10:00:00Z', tags: ['infra', 'design'], project: 'ENGAGE', subtasks: [{ title: 'Review API layer', done: false }, { title: 'Review database schema', done: false }], comments: [{ author: 'user', text: 'Priority review before sprint planning', timestamp: '2026-03-22T10:30:00Z' }] },
  { id: '2', title: 'Research competitor pricing models', description: 'Gather pricing data from top 5 competitors and compile comparison', status: 'inbox', priority: 'medium', assigned_to: null, created_by: 'user', due_date: '2026-03-28', created_at: '2026-03-22T11:00:00Z', updated_at: '2026-03-22T11:00:00Z', tags: ['docs'], project: 'Personal Finance', subtasks: [], comments: [] },
  { id: '3', title: 'Set up WhatsApp notification flow', description: 'Configure whatsapp-cli agent to forward urgent alerts to mobile', status: 'assigned', priority: 'high', assigned_to: 'whatsapp-cli', created_by: 'user', due_date: '2026-03-24', created_at: '2026-03-21T09:00:00Z', updated_at: '2026-03-22T14:00:00Z', tags: ['feature', 'api'], project: 'OpenClaw MC', subtasks: [{ title: 'Configure webhook', done: true }, { title: 'Test notification delivery', done: false }], comments: [{ author: 'whatsapp-cli', text: 'Webhook configured, testing next', timestamp: '2026-03-22T14:00:00Z' }] },
  { id: '4', title: 'Generate monthly finance report', description: 'Compile token costs, API spend, and ROI analysis for March', status: 'assigned', priority: 'medium', assigned_to: 'finance', created_by: 'user', due_date: '2026-03-31', created_at: '2026-03-20T08:00:00Z', updated_at: '2026-03-22T09:00:00Z', tags: ['docs'], project: 'Personal Finance', subtasks: [{ title: 'Gather token usage data', done: false }, { title: 'Calculate costs per model', done: false }, { title: 'Generate charts', done: false }], comments: [] },
  { id: '5', title: 'Benchmark GPT-5.4 vs Claude Opus', description: 'Run comparison on 50 standard prompts and compile results with metrics', status: 'in_progress', priority: 'high', assigned_to: 'compare-llms', created_by: 'user', due_date: '2026-03-26', created_at: '2026-03-21T10:00:00Z', updated_at: '2026-03-23T08:00:00Z', tags: ['testing', 'performance'], project: 'Research', subtasks: [{ title: 'Prepare prompt set', done: true }, { title: 'Run GPT-5.4 benchmarks', done: true }, { title: 'Run Claude Opus benchmarks', done: false }, { title: 'Compile results', done: false }], comments: [{ author: 'compare-llms', text: 'GPT-5.4 results in. Starting Claude run now.', timestamp: '2026-03-23T08:00:00Z' }] },
  { id: '6', title: 'Scrape latest AI policy papers', description: 'Collect and summarize recent AI governance publications from top journals', status: 'in_progress', priority: 'low', assigned_to: 'research', created_by: 'user', due_date: '2026-03-27', created_at: '2026-03-19T15:00:00Z', updated_at: '2026-03-23T07:00:00Z', tags: ['docs'], project: 'Research', subtasks: [{ title: 'Identify sources', done: true }, { title: 'Scrape papers', done: false }, { title: 'Summarize findings', done: false }], comments: [] },
  { id: '7', title: 'Draft blog post on agent orchestration', description: 'Write a technical blog post about multi-agent patterns and best practices', status: 'in_progress', priority: 'medium', assigned_to: 'main', created_by: 'user', due_date: '2026-03-25', created_at: '2026-03-20T12:00:00Z', updated_at: '2026-03-23T06:00:00Z', tags: ['docs'], project: 'OpenClaw MC', subtasks: [{ title: 'Outline structure', done: true }, { title: 'Write first draft', done: false }, { title: 'Add code examples', done: false }], comments: [{ author: 'main', text: 'Outline complete. Working on first draft.', timestamp: '2026-03-23T06:00:00Z' }] },
  { id: '8', title: 'Fix memory retrieval latency', description: 'Investigate and fix slow memory lookups in the main agent causing timeouts', status: 'review', priority: 'critical', assigned_to: 'main', created_by: 'main', due_date: '2026-03-23', created_at: '2026-03-18T10:00:00Z', updated_at: '2026-03-22T18:00:00Z', tags: ['bug', 'performance', 'urgent'], project: 'OpenClaw MC', subtasks: [{ title: 'Profile memory queries', done: true }, { title: 'Add caching layer', done: true }, { title: 'Run regression tests', done: true }], comments: [{ author: 'main', text: 'Added Redis caching. P99 latency dropped from 800ms to 45ms.', timestamp: '2026-03-22T18:00:00Z' }, { author: 'user', text: 'Great improvement. Please verify no stale reads.', timestamp: '2026-03-22T19:00:00Z' }] },
  { id: '9', title: 'Validate Qwen chat output quality', description: 'Review sample outputs for accuracy, tone, and hallucination rate', status: 'review', priority: 'medium', assigned_to: 'qwen-chat', created_by: 'user', due_date: '2026-03-24', created_at: '2026-03-19T14:00:00Z', updated_at: '2026-03-22T16:00:00Z', tags: ['testing'], project: 'Research', subtasks: [{ title: 'Generate test outputs', done: true }, { title: 'Rate accuracy', done: true }, { title: 'Document findings', done: false }], comments: [] },
  { id: '10', title: 'Configure Gemini API credentials', description: 'Set up and validate Gemini API access for the gemini-chat agent', status: 'done', priority: 'high', assigned_to: 'gemini-chat', created_by: 'user', due_date: '2026-03-20', created_at: '2026-03-17T09:00:00Z', updated_at: '2026-03-20T11:00:00Z', tags: ['infra', 'api'], project: 'OpenClaw MC', subtasks: [{ title: 'Get API key', done: true }, { title: 'Configure env vars', done: true }, { title: 'Test connection', done: true }], comments: [{ author: 'gemini-chat', text: 'All configured and verified.', timestamp: '2026-03-20T11:00:00Z' }] },
  { id: '11', title: 'Create agent onboarding checklist', description: 'Document steps for adding a new agent to the fleet with all configurations', status: 'done', priority: 'low', assigned_to: 'main', created_by: 'user', due_date: '2026-03-21', created_at: '2026-03-16T10:00:00Z', updated_at: '2026-03-21T09:00:00Z', tags: ['docs'], project: 'OpenClaw MC', subtasks: [], comments: [] },
  { id: '12', title: 'Audit token usage anomalies', description: 'Investigate unexpected spikes in token consumption across all agents', status: 'inbox', priority: 'critical', assigned_to: null, created_by: 'finance', due_date: '2026-03-24', created_at: '2026-03-23T06:00:00Z', updated_at: '2026-03-23T06:00:00Z', tags: ['bug', 'urgent', 'security'], project: 'Personal Finance', subtasks: [{ title: 'Pull usage logs', done: false }, { title: 'Identify anomalous patterns', done: false }, { title: 'Report findings', done: false }], comments: [{ author: 'finance', text: 'Noticed 3x spike in openai-chat usage yesterday.', timestamp: '2026-03-23T06:00:00Z' }] },
  { id: '13', title: 'Implement dashboard real-time updates', description: 'Add WebSocket connection for live agent status and activity updates', status: 'in_progress', priority: 'high', assigned_to: 'engage-dev', created_by: 'user', due_date: '2026-03-26', created_at: '2026-03-21T08:00:00Z', updated_at: '2026-03-23T09:00:00Z', tags: ['feature', 'api'], project: 'OpenClaw MC', subtasks: [{ title: 'Set up WebSocket client', done: true }, { title: 'Handle reconnection logic', done: false }, { title: 'Integrate with Zustand store', done: false }], comments: [{ author: 'engage-dev', text: 'WebSocket client working. Implementing reconnect.', timestamp: '2026-03-23T09:00:00Z' }] },
  { id: '14', title: 'Design cost alert thresholds', description: 'Define automated alerts when token spend exceeds budget thresholds', status: 'inbox', priority: 'medium', assigned_to: null, created_by: 'user', due_date: '2026-03-29', created_at: '2026-03-22T14:00:00Z', updated_at: '2026-03-22T14:00:00Z', tags: ['feature', 'design'], project: 'Personal Finance', subtasks: [], comments: [] },
  { id: '15', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment to Railway', status: 'assigned', priority: 'high', assigned_to: 'general-work', created_by: 'user', due_date: '2026-03-25', created_at: '2026-03-21T11:00:00Z', updated_at: '2026-03-22T10:00:00Z', tags: ['infra'], project: 'OpenClaw MC', subtasks: [{ title: 'Create workflow file', done: false }, { title: 'Add test step', done: false }, { title: 'Add deploy step', done: false }], comments: [] },
  { id: '16', title: 'Research RAG improvements', description: 'Evaluate latest RAG techniques for better agent memory retrieval', status: 'assigned', priority: 'medium', assigned_to: 'research', created_by: 'user', due_date: '2026-03-28', created_at: '2026-03-22T09:00:00Z', updated_at: '2026-03-22T09:00:00Z', tags: ['feature', 'performance'], project: 'Research', subtasks: [{ title: 'Review recent papers', done: false }, { title: 'Test hybrid search', done: false }], comments: [] },
  { id: '17', title: 'Add error tracking integration', description: 'Integrate Sentry or similar for monitoring agent errors in production', status: 'inbox', priority: 'medium', assigned_to: null, created_by: 'user', due_date: '2026-03-30', created_at: '2026-03-23T07:00:00Z', updated_at: '2026-03-23T07:00:00Z', tags: ['infra', 'feature'], project: 'OpenClaw MC', subtasks: [], comments: [] },
  { id: '18', title: 'Optimize Anthropic API batching', description: 'Implement request batching to reduce API costs for anthropic-chat agent', status: 'in_progress', priority: 'high', assigned_to: 'anthropic-chat', created_by: 'finance', due_date: '2026-03-25', created_at: '2026-03-20T16:00:00Z', updated_at: '2026-03-23T10:00:00Z', tags: ['performance', 'api'], project: 'OpenClaw MC', subtasks: [{ title: 'Analyze current request patterns', done: true }, { title: 'Implement batch queue', done: false }, { title: 'Measure cost savings', done: false }], comments: [{ author: 'anthropic-chat', text: 'Current pattern sends 1 req per message. Batching could save ~30%.', timestamp: '2026-03-23T10:00:00Z' }] },
  { id: '19', title: 'Write ENGAGE user documentation', description: 'Create comprehensive user guide for the ENGAGE platform features', status: 'assigned', priority: 'low', assigned_to: 'personal', created_by: 'user', due_date: '2026-04-02', created_at: '2026-03-22T13:00:00Z', updated_at: '2026-03-22T13:00:00Z', tags: ['docs'], project: 'ENGAGE', subtasks: [{ title: 'Outline sections', done: false }, { title: 'Write getting started guide', done: false }, { title: 'Add screenshots', done: false }], comments: [] },
  { id: '20', title: 'Security audit of gateway auth', description: 'Review and pen-test the OpenClaw gateway authentication mechanism', status: 'review', priority: 'critical', assigned_to: 'main', created_by: 'user', due_date: '2026-03-23', created_at: '2026-03-19T08:00:00Z', updated_at: '2026-03-23T05:00:00Z', tags: ['security', 'urgent'], project: 'OpenClaw MC', subtasks: [{ title: 'Review token validation', done: true }, { title: 'Test for injection attacks', done: true }, { title: 'Check rate limiting', done: true }, { title: 'Write security report', done: true }], comments: [{ author: 'main', text: 'Audit complete. Found 2 medium issues — rate limiting gaps on /ws endpoint. Fix PR submitted.', timestamp: '2026-03-23T05:00:00Z' }] },
  { id: '21', title: 'Build ENGAGE onboarding wizard', description: 'Create a multi-step onboarding flow for new ENGAGE users', status: 'inbox', priority: 'high', assigned_to: null, created_by: 'user', due_date: '2026-03-27', created_at: '2026-03-23T08:00:00Z', updated_at: '2026-03-23T08:00:00Z', tags: ['feature', 'design'], project: 'ENGAGE', subtasks: [], comments: [] },
  { id: '22', title: 'Migrate finance data to new schema', description: 'Update finance tracking tables to support multi-currency and new cost categories', status: 'done', priority: 'high', assigned_to: 'finance', created_by: 'user', due_date: '2026-03-22', created_at: '2026-03-18T11:00:00Z', updated_at: '2026-03-22T15:00:00Z', tags: ['infra'], project: 'Personal Finance', subtasks: [{ title: 'Design new schema', done: true }, { title: 'Write migration script', done: true }, { title: 'Run migration', done: true }, { title: 'Verify data integrity', done: true }], comments: [{ author: 'finance', text: 'Migration complete. All data verified.', timestamp: '2026-03-22T15:00:00Z' }] },
  { id: '23', title: 'Integrate Sara with OpenRouter', description: 'Set up sara-intimate agent to route through OpenRouter for model flexibility', status: 'done', priority: 'medium', assigned_to: 'sara-intimate', created_by: 'user', due_date: '2026-03-19', created_at: '2026-03-15T10:00:00Z', updated_at: '2026-03-19T14:00:00Z', tags: ['api', 'infra'], project: 'OpenClaw MC', subtasks: [], comments: [{ author: 'sara-intimate', text: 'Connected and tested. All models available.', timestamp: '2026-03-19T14:00:00Z' }] },
  { id: '24', title: 'Create investment portfolio tracker', description: 'Build a dashboard view for tracking investment portfolio performance', status: 'inbox', priority: 'low', assigned_to: null, created_by: 'user', due_date: '2026-04-05', created_at: '2026-03-23T09:00:00Z', updated_at: '2026-03-23T09:00:00Z', tags: ['feature', 'design'], project: 'Personal Finance', subtasks: [], comments: [] },
]

// ─── Constants ─────────────────────────────────────────────────
const columns: { key: Task['status']; label: string; accent: string }[] = [
  { key: 'inbox', label: 'Inbox', accent: 'var(--accent-blue)' },
  { key: 'assigned', label: 'Assigned', accent: 'var(--accent-purple)' },
  { key: 'in_progress', label: 'In Progress', accent: 'var(--accent-orange)' },
  { key: 'review', label: 'Review', accent: 'var(--accent-red)' },
  { key: 'done', label: 'Done', accent: 'var(--accent-green)' },
]

const priorityConfig = {
  critical: { color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10', icon: AlertTriangle, order: 0 },
  high: { color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10', icon: ArrowUp, order: 1 },
  medium: { color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10', icon: ArrowRight, order: 2 },
  low: { color: 'text-[var(--text-muted)]', bg: 'bg-white/5', icon: ArrowDown, order: 3 },
}

// ─── Helpers ───────────────────────────────────────────────────
function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'done') return false
  return new Date(task.due_date) < new Date('2026-03-23T12:00:00Z')
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// ─── Stats Bar ─────────────────────────────────────────────────
function StatsBar({ tasks }: { tasks: Task[] }) {
  const total = tasks.length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const completed = tasks.filter(t => t.status === 'done').length
  const overdue = tasks.filter(isOverdue).length

  const stats = [
    { label: 'Total', value: total, icon: BarChart3, color: 'var(--accent-blue)' },
    { label: 'In Progress', value: inProgress, icon: Timer, color: 'var(--accent-orange)' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'var(--accent-green)' },
    { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'var(--accent-red)' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-[var(--bg-card)] rounded-lg border border-[var(--border)] p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
            <s.icon size={16} style={{ color: s.color }} />
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{s.value}</p>
            <p className="text-[11px] text-[var(--text-muted)]">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Task Card (Kanban) ────────────────────────────────────────
function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const priority = priorityConfig[task.priority]
  const PriorityIcon = priority.icon
  const overdue = isOverdue(task)
  const doneSubtasks = task.subtasks.filter(s => s.done).length

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-[var(--bg-card)] rounded-lg border border-[var(--border)] p-3 hover:border-[var(--text-muted)]/50 transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-medium text-[var(--text-primary)] leading-tight group-hover:text-white transition-colors">
          {task.title}
        </h3>
        <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.color} ${priority.bg}`}>
          <PriorityIcon size={10} />
          {task.priority}
        </span>
      </div>

      {task.project && (
        <span className="inline-block text-[10px] text-[var(--accent-purple)] bg-[var(--accent-purple)]/10 px-1.5 py-0.5 rounded mb-1.5">
          {task.project}
        </span>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] text-[var(--text-muted)] bg-white/5 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] text-[var(--text-muted)]">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          {task.assigned_to ? (
            <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
              <User size={10} />
              {task.assigned_to}
            </span>
          ) : (
            <span className="text-[var(--text-muted)] italic">Unassigned</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
              <CheckSquare size={10} />
              {doneSubtasks}/{task.subtasks.length}
            </span>
          )}
          {task.comments.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[var(--text-muted)]">
              <MessageSquare size={10} />
              {task.comments.length}
            </span>
          )}
          {task.due_date && (
            <span className={`inline-flex items-center gap-1 ${overdue ? 'text-[var(--accent-red)]' : 'text-[var(--text-muted)]'}`}>
              <Clock size={10} />
              {formatDate(task.due_date)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Task Detail Panel ─────────────────────────────────────────
function TaskDetail({ task, onClose }: { task: Task; onClose: () => void }) {
  const priority = priorityConfig[task.priority]
  const PriorityIcon = priority.icon
  const overdue = isOverdue(task)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-lg h-full bg-[var(--bg-secondary)] border-l border-[var(--border)] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--border)] p-4 flex items-center justify-between z-10">
          <h2 className="text-base font-semibold text-[var(--text-primary)] truncate pr-4">{task.title}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)]" aria-label="Close detail panel">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[var(--text-muted)] text-xs mb-1">Status</p>
              <span className="capitalize text-[var(--text-primary)]">{task.status.replace('_', ' ')}</span>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs mb-1">Priority</p>
              <span className={`inline-flex items-center gap-1 ${priority.color}`}>
                <PriorityIcon size={12} />
                <span className="capitalize">{task.priority}</span>
              </span>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs mb-1">Assignee</p>
              <span className="text-[var(--text-primary)]">{task.assigned_to ?? 'Unassigned'}</span>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs mb-1">Due Date</p>
              <span className={overdue ? 'text-[var(--accent-red)]' : 'text-[var(--text-primary)]'}>
                {task.due_date ? formatDate(task.due_date) : 'None'}
                {overdue && ' (overdue)'}
              </span>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs mb-1">Project</p>
              <span className="text-[var(--text-primary)]">{task.project ?? 'None'}</span>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-xs mb-1">Created</p>
              <span className="text-[var(--text-primary)]">{formatDate(task.created_at)}</span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-[var(--text-muted)] text-xs mb-1">Description</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <p className="text-[var(--text-muted)] text-xs mb-2 flex items-center gap-1"><Tag size={11} /> Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map(tag => (
                  <span key={tag} className="text-xs text-[var(--text-secondary)] bg-white/5 px-2 py-0.5 rounded border border-[var(--border)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div>
              <p className="text-[var(--text-muted)] text-xs mb-2 flex items-center gap-1">
                <CheckSquare size={11} /> Subtasks ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length})
              </p>
              <div className="space-y-1.5">
                {task.subtasks.map((st, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {st.done ? (
                      <CheckSquare size={14} className="text-[var(--accent-green)] shrink-0" />
                    ) : (
                      <Square size={14} className="text-[var(--text-muted)] shrink-0" />
                    )}
                    <span className={st.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}>{st.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {task.comments.length > 0 && (
            <div>
              <p className="text-[var(--text-muted)] text-xs mb-2 flex items-center gap-1">
                <MessageSquare size={11} /> Comments ({task.comments.length})
              </p>
              <div className="space-y-3">
                {task.comments.map((c, i) => (
                  <div key={i} className="bg-[var(--bg-card)] rounded-lg p-3 border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[var(--accent-blue)]">{c.author}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{formatTimestamp(c.timestamp)}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── New Task Form ─────────────────────────────────────────────
function NewTaskForm({ onSubmit, onCancel }: { onSubmit: (task: Task) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [project, setProject] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const now = new Date().toISOString()
    onSubmit({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || null,
      status: 'inbox',
      priority,
      assigned_to: assignee || null,
      created_by: 'user',
      due_date: dueDate || null,
      created_at: now,
      updated_at: now,
      tags,
      project: project || null,
      subtasks: [],
      comments: [],
    })
  }

  const inputClass = 'w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] p-5 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">New Task</h2>
          <button type="button" onClick={onCancel} className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)]" aria-label="Close form">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Task title *" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={2} className={inputClass} />

          <div className="grid grid-cols-2 gap-3">
            <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} className={inputClass} aria-label="Priority">
              {priorityOptions.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <select value={assignee} onChange={e => setAssignee(e.target.value)} className={inputClass} aria-label="Assignee">
              <option value="">Unassigned</option>
              {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} aria-label="Due date" />
            <select value={project} onChange={e => setProject(e.target.value)} className={inputClass} aria-label="Project">
              <option value="">No Project</option>
              {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Tags */}
          <div>
            <div className="flex gap-2">
              <input type="text" placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} className={inputClass}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-white/5 border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-white/10">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-white/5 text-[var(--text-secondary)] px-2 py-0.5 rounded border border-[var(--border)]">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-[var(--accent-red)]" aria-label={`Remove tag ${tag}`}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-[var(--accent-blue)] text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 transition-opacity">
              Create Task
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/5 border border-[var(--border)] rounded-lg text-sm text-[var(--text-secondary)] hover:bg-white/10">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Filter Dropdown ───────────────────────────────────────────
function FilterDropdown({ label, icon: Icon, value, options, onChange }: {
  label: string
  icon: React.ElementType
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        <Icon size={13} className="text-[var(--text-muted)]" />
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="appearance-none bg-[var(--bg-card)] border border-[var(--border)] rounded-lg pl-2 pr-7 py-1.5 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-blue)] cursor-pointer"
          aria-label={label}
        >
          <option value="">All {label}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
      </div>
    </div>
  )
}

// ─── List View ─────────────────────────────────────────────────
function ListView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
  const [sortKey, setSortKey] = useState<'priority' | 'due_date' | 'status' | 'title'>('priority')
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'priority':
          cmp = priorityConfig[a.priority].order - priorityConfig[b.priority].order
          break
        case 'due_date':
          cmp = (a.due_date ?? '9999').localeCompare(b.due_date ?? '9999')
          break
        case 'status':
          cmp = columns.findIndex(c => c.key === a.status) - columns.findIndex(c => c.key === b.status)
          break
        case 'title':
          cmp = a.title.localeCompare(b.title)
          break
      }
      return sortAsc ? cmp : -cmp
    })
  }, [tasks, sortKey, sortAsc])

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  const headerClass = 'px-3 py-2 text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-secondary)] select-none'
  const sortIndicator = (key: typeof sortKey) => sortKey === key ? (sortAsc ? ' \u2191' : ' \u2193') : ''

  return (
    <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className={`${headerClass} text-left min-w-[250px]`} onClick={() => toggleSort('title')}>Title{sortIndicator('title')}</th>
              <th className={`${headerClass} text-left w-28`} onClick={() => toggleSort('status')}>Status{sortIndicator('status')}</th>
              <th className={`${headerClass} text-left w-24`} onClick={() => toggleSort('priority')}>Priority{sortIndicator('priority')}</th>
              <th className={`${headerClass} text-left w-28`}>Assignee</th>
              <th className={`${headerClass} text-left w-28`}>Project</th>
              <th className={`${headerClass} text-left w-24`} onClick={() => toggleSort('due_date')}>Due{sortIndicator('due_date')}</th>
              <th className={`${headerClass} text-left w-16`}>Progress</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(task => {
              const p = priorityConfig[task.priority]
              const PIcon = p.icon
              const overdue = isOverdue(task)
              const col = columns.find(c => c.key === task.status)
              const doneCount = task.subtasks.filter(s => s.done).length
              return (
                <tr
                  key={task.id}
                  className="border-b border-[var(--border)] hover:bg-white/[0.02] cursor-pointer transition-colors"
                  onClick={() => onTaskClick(task)}
                >
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-[var(--text-primary)]">{task.title}</div>
                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {task.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] text-[var(--text-muted)] bg-white/5 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <CircleDot size={10} style={{ color: col?.accent }} />
                      <span className="capitalize text-[var(--text-secondary)]">{task.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1 text-xs ${p.color}`}>
                      <PIcon size={11} />
                      <span className="capitalize">{task.priority}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[var(--text-secondary)]">
                    {task.assigned_to ?? <span className="italic text-[var(--text-muted)]">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    {task.project ? (
                      <span className="text-[10px] text-[var(--accent-purple)] bg-[var(--accent-purple)]/10 px-1.5 py-0.5 rounded">{task.project}</span>
                    ) : <span className="text-xs text-[var(--text-muted)]">—</span>}
                  </td>
                  <td className={`px-3 py-2.5 text-xs ${overdue ? 'text-[var(--accent-red)]' : 'text-[var(--text-muted)]'}`}>
                    {task.due_date ? formatDate(task.due_date) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[var(--text-muted)]">
                    {task.subtasks.length > 0 ? `${doneCount}/${task.subtasks.length}` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Kanban View ───────────────────────────────────────────────
function KanbanView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (task: Task) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 min-h-[calc(100vh-18rem)]">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key)
        return (
          <div key={col.key} className="flex flex-col">
            <div className="flex items-center gap-2 mb-3 px-1">
              <CircleDot size={14} style={{ color: col.accent }} />
              <span className="text-sm font-medium text-[var(--text-primary)]">{col.label}</span>
              <span className="ml-auto text-xs text-[var(--text-muted)] bg-white/5 px-1.5 py-0.5 rounded-full">
                {colTasks.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] p-2 overflow-y-auto">
              {colTasks.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] text-center py-8">No tasks</p>
              ) : (
                colTasks.map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />)
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [showNewTask, setShowNewTask] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const filtered = useMemo(() => {
    return tasks.filter(task => {
      if (search) {
        const q = search.toLowerCase()
        const matches = task.title.toLowerCase().includes(q)
          || task.description?.toLowerCase().includes(q)
          || task.tags.some(t => t.toLowerCase().includes(q))
          || task.assigned_to?.toLowerCase().includes(q)
          || task.project?.toLowerCase().includes(q)
        if (!matches) return false
      }
      if (projectFilter && task.project !== projectFilter) return false
      if (assigneeFilter && task.assigned_to !== assigneeFilter) return false
      if (priorityFilter && task.priority !== priorityFilter) return false
      return true
    })
  }, [tasks, search, projectFilter, assigneeFilter, priorityFilter])

  function handleNewTask(task: Task) {
    setTasks([task, ...tasks])
    setShowNewTask(false)
  }

  const usedAssignees = [...new Set(tasks.map(t => t.assigned_to).filter(Boolean))] as string[]
  const usedProjects = [...new Set(tasks.map(t => t.project).filter(Boolean))] as string[]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Task Management</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={`p-1.5 ${view === 'kanban' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              aria-label="Kanban view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`p-1.5 ${view === 'list' ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowNewTask(true)}
            className="inline-flex items-center gap-1.5 bg-[var(--accent-blue)] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsBar tasks={tasks} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]"
          />
        </div>
        <FilterDropdown label="Projects" icon={FolderOpen} value={projectFilter} options={usedProjects} onChange={setProjectFilter} />
        <FilterDropdown label="Assignees" icon={User} value={assigneeFilter} options={usedAssignees} onChange={setAssigneeFilter} />
        <FilterDropdown label="Priorities" icon={Filter} value={priorityFilter} options={priorityOptions} onChange={setPriorityFilter} />

        {(search || projectFilter || assigneeFilter || priorityFilter) && (
          <button
            type="button"
            onClick={() => { setSearch(''); setProjectFilter(''); setAssigneeFilter(''); setPriorityFilter('') }}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-red)] flex items-center gap-1"
          >
            <X size={12} /> Clear
          </button>
        )}

        <span className="ml-auto text-xs text-[var(--text-muted)]">
          {filtered.length} of {tasks.length} tasks
        </span>
      </div>

      {/* View */}
      {view === 'kanban' ? (
        <KanbanView tasks={filtered} onTaskClick={setSelectedTask} />
      ) : (
        <ListView tasks={filtered} onTaskClick={setSelectedTask} />
      )}

      {/* Modals */}
      {showNewTask && <NewTaskForm onSubmit={handleNewTask} onCancel={() => setShowNewTask(false)} />}
      {selectedTask && <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />}
    </div>
  )
}
