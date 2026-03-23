export interface Agent {
  id: string
  name: string
  model: string
  status: 'active' | 'idle' | 'offline' | 'error'
  role: string
  channel: string
  last_seen: string | null
  token_usage_today: number
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done'
  priority: 'critical' | 'high' | 'medium' | 'low'
  assigned_to: string | null
  created_by: string
  due_date: string | null
  created_at: string
  updated_at: string
  tags: string[]
  project: string | null
  subtasks: { title: string; done: boolean }[]
  comments: { author: string; text: string; timestamp: string }[]
}

export interface Activity {
  id: string
  agent_id: string
  type: 'message' | 'tool_call' | 'error' | 'task_update' | 'system'
  content: string
  channel: string | null
  timestamp: string
}

export interface Metric {
  id: string
  agent_id: string
  model: string
  input_tokens: number
  output_tokens: number
  cost: number
  timestamp: string
}

export interface Persona {
  id: string
  name: string
  displayName: string
  avatar: string
  role: 'Frontend Developer' | 'Backend Developer' | 'QA Engineer' | 'DevOps' | 'Researcher' | 'Project Manager' | 'Security Engineer' | 'Technical Writer'
  skills: string[]
  description: string
  status: 'active' | 'idle' | 'offline'
  currentTask: string | null
  agentId: string
  model: string
  channel: string
}

export interface CronJob {
  id: string
  name: string
  schedule: string
  status: 'enabled' | 'disabled'
  last_run: string | null
  next_run: string | null
  agent_id: string | null
}
