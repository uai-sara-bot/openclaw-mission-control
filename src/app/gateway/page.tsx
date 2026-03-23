'use client'

import { useState, useEffect, useCallback } from 'react'
import { Globe, Wifi, WifiOff, RefreshCw, Trash2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface LogEntry {
  timestamp: string
  message: string
  type: 'info' | 'success' | 'error'
}

const STORAGE_KEY = 'openclaw-gateway-settings'

function getStoredSettings() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function GatewayPage() {
  const [url, setUrl] = useState('wss://gateway.openclaw.ai')
  const [token, setToken] = useState('')
  const [autoReconnect, setAutoReconnect] = useState(true)
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    const stored = getStoredSettings()
    if (stored) {
      setUrl(stored.url || 'wss://gateway.openclaw.ai')
      setToken(stored.token || '')
      setAutoReconnect(stored.autoReconnect ?? true)
    }
  }, [])

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [
      { timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), message, type },
      ...prev.slice(0, 49),
    ])
  }, [])

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ url, token, autoReconnect }))
    addLog('Settings saved to local storage', 'success')
  }

  function testConnection() {
    if (!url) {
      addLog('Gateway URL is required', 'error')
      return
    }
    setStatus('connecting')
    addLog(`Connecting to ${url}...`)

    // Simulate connection test
    setTimeout(() => {
      if (url.startsWith('wss://') || url.startsWith('ws://')) {
        setStatus('connected')
        addLog('Connection established successfully', 'success')
      } else {
        setStatus('error')
        addLog('Invalid WebSocket URL — must start with wss:// or ws://', 'error')
      }
    }, 1500)
  }

  function disconnect() {
    setStatus('disconnected')
    addLog('Disconnected from gateway', 'info')
  }

  const statusConfig = {
    disconnected: { color: 'var(--text-muted)', label: 'Disconnected', dot: 'bg-[var(--text-muted)]' },
    connecting: { color: 'var(--accent-orange)', label: 'Connecting...', dot: 'bg-[var(--accent-orange)] animate-pulse' },
    connected: { color: 'var(--accent-green)', label: 'Connected', dot: 'bg-[var(--accent-green)]' },
    error: { color: 'var(--accent-red)', label: 'Error', dot: 'bg-[var(--accent-red)]' },
  }

  const current = statusConfig[status]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Gateway Connection</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Manage the WebSocket connection to the OpenClaw gateway</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connection Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
            <div className={cn('w-3 h-3 rounded-full', current.dot)} />
            <span className="text-sm font-medium" style={{ color: current.color }}>{current.label}</span>
            {status === 'connected' && (
              <span className="text-xs text-[var(--text-muted)] ml-auto">Latency: 42ms</span>
            )}
          </div>

          {/* Form */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-4">
            <div>
              <label className="text-sm text-[var(--text-primary)] block mb-1.5">Gateway URL</label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="wss://gateway.openclaw.ai"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-blue)]/50"
              />
            </div>

            <div>
              <label className="text-sm text-[var(--text-primary)] block mb-1.5">Gateway Token</label>
              <input
                type="password"
                value={token}
                onChange={e => setToken(e.target.value)}
                placeholder="oc_gw_..."
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--accent-blue)]/50"
              />
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-primary)]">Auto-Reconnect</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Automatically reconnect when connection drops</p>
                </div>
                <button
                  onClick={() => setAutoReconnect(!autoReconnect)}
                  role="switch"
                  aria-checked={autoReconnect}
                  aria-label="Auto-Reconnect"
                  className={cn(
                    'relative w-9 h-5 rounded-full transition-colors',
                    autoReconnect ? 'bg-[var(--accent-blue)]' : 'bg-[var(--border)]'
                  )}
                >
                  <div className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                    autoReconnect ? 'translate-x-4.5' : 'translate-x-0.5'
                  )} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {status === 'connected' ? (
                <button
                  onClick={disconnect}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-red)]/10 text-[var(--accent-red)] text-sm hover:bg-[var(--accent-red)]/20 transition-colors"
                >
                  <WifiOff size={16} />
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={testConnection}
                  disabled={status === 'connecting'}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors',
                    status === 'connecting'
                      ? 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)] cursor-wait'
                      : 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/20'
                  )}
                >
                  {status === 'connecting' ? <RefreshCw size={16} className="animate-spin" /> : <Wifi size={16} />}
                  {status === 'connecting' ? 'Connecting...' : 'Test Connection'}
                </button>
              )}
              <button
                onClick={saveSettings}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-[var(--text-secondary)] text-sm hover:bg-white/10 hover:text-[var(--text-primary)] transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>

          {/* Connection Log */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-[var(--text-primary)]">Connection Log</h2>
              {logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              )}
            </div>
            {logs.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No connection events yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="text-[var(--text-muted)] font-mono shrink-0">{log.timestamp}</span>
                    <span className={cn(
                      log.type === 'success' && 'text-[var(--accent-green)]',
                      log.type === 'error' && 'text-[var(--accent-red)]',
                      log.type === 'info' && 'text-[var(--text-secondary)]',
                    )}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-[var(--accent-blue)]" />
              <h2 className="text-sm font-medium text-[var(--text-primary)]">Setup Guide</h2>
            </div>
            <div className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
              <div>
                <p className="text-[var(--text-primary)] font-medium mb-1">Gateway URL</p>
                <p>The WebSocket URL for your OpenClaw gateway. Usually in the format <code className="px-1 py-0.5 rounded bg-white/5 font-mono text-[var(--accent-blue)]">wss://gateway.openclaw.ai</code></p>
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-medium mb-1">Gateway Token</p>
                <p>Your authentication token for the gateway API. Found in your OpenClaw dashboard under API settings. Tokens start with <code className="px-1 py-0.5 rounded bg-white/5 font-mono text-[var(--accent-blue)]">oc_gw_</code></p>
              </div>
              <div>
                <p className="text-[var(--text-primary)] font-medium mb-1">Environment Variables</p>
                <p>You can also set these via environment variables:</p>
                <div className="mt-1.5 p-2 rounded-lg bg-[var(--bg-secondary)] font-mono text-[10px] space-y-0.5">
                  <p>OPENCLAW_GATEWAY_URL</p>
                  <p>OPENCLAW_GATEWAY_TOKEN</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 space-y-3">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Connection Details</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Protocol</span>
                <span className="text-[var(--text-secondary)] font-mono">WebSocket (WSS)</span>
              </div>
              <div className="border-t border-[var(--border)]" />
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Auth</span>
                <span className="text-[var(--text-secondary)] font-mono">Bearer Token</span>
              </div>
              <div className="border-t border-[var(--border)]" />
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Agents</span>
                <span className="text-[var(--text-secondary)] font-mono">13 configured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
