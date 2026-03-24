'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Settings, Globe, Bell, Database, Info,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Section = 'general' | 'gateway' | 'notifications' | 'data' | 'about'

const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'gateway', label: 'Gateway', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'data', label: 'Data Retention', icon: Database },
  { id: 'about', label: 'About', icon: Info },
]

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn(
        'relative w-9 h-5 rounded-full transition-colors',
        checked ? 'bg-[var(--accent-blue)]' : 'bg-[var(--border)]'
      )}
    >
      <div className={cn(
        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
        checked ? 'translate-x-4.5' : 'translate-x-0.5'
      )} />
    </button>
  )
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('general')
  const [theme, setTheme] = useState('dark')
  const [refreshRate, setRefreshRate] = useState('5')
  const [gatewayUrl, setGatewayUrl] = useState('wss://gateway.openclaw.ai')
  const [gatewayToken, setGatewayToken] = useState('oc_gw_****************************')
  const [reconnect, setReconnect] = useState(true)
  const [notifyErrors, setNotifyErrors] = useState(true)
  const [notifyTasks, setNotifyTasks] = useState(true)
  const [notifyCost, setNotifyCost] = useState(false)
  const [costThreshold, setCostThreshold] = useState('50')
  const [retentionActivity, setRetentionActivity] = useState('30')
  const [retentionMetrics, setRetentionMetrics] = useState('90')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Configure Mission Control preferences</p>
      </div>

      <div className="flex gap-4" style={{ minHeight: '60vh' }}>
        {/* Section Nav */}
        <div className="w-52 shrink-0 space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors',
                activeSection === section.id
                  ? 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              )}
            >
              <section.icon size={16} />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
          {activeSection === 'general' && (
            <div className="space-y-6">
              <h2 className="text-base font-medium text-[var(--text-primary)]">General Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">Theme</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Select your preferred appearance</p>
                  </div>
                  <div className="flex gap-1">
                    {['dark', 'light', 'system'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          'px-3 py-1.5 rounded-md text-xs capitalize transition-colors',
                          theme === t
                            ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                            : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">Dashboard Refresh Rate</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">How often to poll for updates (seconds)</p>
                  </div>
                  <select
                    value={refreshRate}
                    onChange={e => setRefreshRate(e.target.value)}
                    className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]/50"
                  >
                    <option value="1">1s</option>
                    <option value="5">5s</option>
                    <option value="10">10s</option>
                    <option value="30">30s</option>
                  </select>
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">Timezone</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Used for displaying timestamps</p>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">UTC+1 (Europe/Amsterdam)</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'gateway' && (
            <div className="space-y-6">
              <h2 className="text-base font-medium text-[var(--text-primary)]">Gateway Connection</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[var(--text-primary)] block mb-1.5">Gateway URL</label>
                  <input
                    type="text"
                    value={gatewayUrl}
                    onChange={e => setGatewayUrl(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-blue)]/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--text-primary)] block mb-1.5">Gateway Token</label>
                  <input
                    type="password"
                    value={gatewayToken}
                    onChange={e => setGatewayToken(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-blue)]/50"
                  />
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">Auto-Reconnect</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Automatically reconnect on disconnect</p>
                  </div>
                  <Toggle checked={reconnect} onChange={setReconnect} label="Auto-Reconnect" />
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
                  <span className="text-sm text-[var(--accent-green)]">Connected</span>
                  <span className="text-xs text-[var(--text-muted)]">Latency: 42ms</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-base font-medium text-[var(--text-primary)]">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">Agent Errors</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Notify when any agent encounters an error</p>
                  </div>
                  <Toggle checked={notifyErrors} onChange={setNotifyErrors} label="Agent Errors notifications" />
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">Task Assignments</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Notify when tasks need human review</p>
                  </div>
                  <Toggle checked={notifyTasks} onChange={setNotifyTasks} label="Task Assignment notifications" />
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">Cost Alerts</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Notify when daily spend exceeds threshold</p>
                  </div>
                  <Toggle checked={notifyCost} onChange={setNotifyCost} label="Cost Alert notifications" />
                </div>
                {notifyCost && (
                  <div className="ml-4">
                    <label className="text-xs text-[var(--text-muted)] block mb-1">Threshold ($)</label>
                    <input
                      type="number"
                      value={costThreshold}
                      onChange={e => setCostThreshold(e.target.value)}
                      className="w-32 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-blue)]/50"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="space-y-6">
              <h2 className="text-base font-medium text-[var(--text-primary)]">Data Retention</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">Activity Logs</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">How long to keep activity feed entries</p>
                  </div>
                  <select
                    value={retentionActivity}
                    onChange={e => setRetentionActivity(e.target.value)}
                    className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]/50"
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">Cost Metrics</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">How long to keep token usage data</p>
                  </div>
                  <select
                    value={retentionMetrics}
                    onChange={e => setRetentionMetrics(e.target.value)}
                    className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-blue)]/50"
                  >
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">Current Storage</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Database size across all tables</p>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">247 MB / 500 MB</span>
                </div>
                <div className="border-t border-[var(--border)]" />
                <button onClick={() => toast('Coming soon')} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--accent-red)] hover:bg-[var(--accent-red)]/10 transition-colors">
                  <Trash2 size={14} />
                  Purge Expired Data
                </button>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="space-y-6">
              <h2 className="text-base font-medium text-[var(--text-primary)]">About</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Application</span>
                  <span className="text-sm text-[var(--text-primary)] font-medium">OpenClaw Mission Control</span>
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Version</span>
                  <span className="text-xs text-[var(--text-primary)] font-mono">0.1.0-alpha</span>
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Framework</span>
                  <span className="text-xs text-[var(--text-primary)] font-mono">Next.js 15.1.8</span>
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Deployment</span>
                  <span className="text-xs text-[var(--text-primary)] font-mono">Railway</span>
                </div>
                <div className="border-t border-[var(--border)]" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Active Agents</span>
                  <span className="text-xs text-[var(--text-primary)] font-mono">13</span>
                </div>
                <div className="border-t border-[var(--border)]" />
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Built for OpenClaw AI agent orchestration. Provides real-time monitoring, task management, and cost tracking for a fleet of 13 AI agents across multiple model providers.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
