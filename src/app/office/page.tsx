'use client'
import { useState, useEffect } from 'react'

const agents = [
  { name: 'Henry', color: '#a855f7', x: 5, y: 3, status: 'working', task: 'Coordinating ops review' },
  { name: 'Charlie', color: '#3b82f6', x: 2, y: 5, status: 'working', task: 'SpacetimeDB module' },
  { name: 'Ralph', color: '#f97316', x: 8, y: 5, status: 'working', task: 'Triaging tests' },
  { name: 'Scout', color: '#22c55e', x: 3, y: 2, status: 'working', task: 'Competitor analysis' },
  { name: 'Quill', color: '#ec4899', x: 7, y: 2, status: 'working', task: 'Drafting script' },
  { name: 'Pixel', color: '#f59e0b', x: 5, y: 7, status: 'idle', task: 'Standing by' },
  { name: 'Echo', color: '#06b6d4', x: 1, y: 7, status: 'working', task: 'Social scheduling' },
  { name: 'Codex', color: '#8b5cf6', x: 9, y: 7, status: 'working', task: 'Auth refactor' },
]

export default function OfficePage() {
  const [positions, setPositions] = useState(agents.map(a => ({ x: a.x, y: a.y })))

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map((pos, i) => {
        if (agents[i].status === 'idle') return pos
        if (Math.random() > 0.7) {
          return {
            x: Math.max(0, Math.min(10, pos.x + (Math.random() > 0.5 ? 1 : -1))),
            y: Math.max(0, Math.min(8, pos.y + (Math.random() > 0.5 ? 1 : -1))),
          }
        }
        return pos
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const desks = [[1,1],[3,1],[5,1],[7,1],[9,1],[1,4],[3,4],[5,4],[7,4],[9,4],[1,7],[3,7],[5,7],[7,7],[9,7]]
  const confTable = { x: 4, y: 3, w: 3, h: 2 }
  const CELL = 56

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Controls */}
      <div className="flex items-center gap-2 p-4 border-b border-white/10">
        <span className="text-sm text-gray-400 mr-2">Demo Controls</span>
        {['All Working', 'Gather', 'Run Meeting', 'Watercooler'].map(btn => (
          <button
            key={btn}
            onClick={() => alert(`${btn} triggered`)}
            className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border border-teal-500/30 rounded text-sm transition-colors"
          >
            {btn}
          </button>
        ))}
        <button
          onClick={() => alert('Chat started')}
          className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-black rounded text-sm font-medium ml-2"
        >
          + Start Chat
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Office Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="relative" style={{ width: 11 * CELL, height: 9 * CELL }}>
            {/* Floor tiles */}
            {Array.from({ length: 11 * 9 }, (_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: (i % 11) * CELL,
                  top: Math.floor(i / 11) * CELL,
                  width: CELL,
                  height: CELL,
                  background: i % 2 === 0 ? '#0f0f18' : '#111118',
                  border: '1px solid rgba(255,255,255,0.03)',
                }}
              />
            ))}

            {/* Desks */}
            {desks.map(([dx, dy], i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: dx * CELL + 4,
                  top: dy * CELL + 4,
                  width: CELL - 8,
                  height: CELL - 8,
                  background: 'rgba(0,212,170,0.15)',
                  border: '1px solid rgba(0,212,170,0.3)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: 16, height: 12, background: 'rgba(0,212,170,0.5)', borderRadius: 2 }} />
              </div>
            ))}

            {/* Conference table */}
            <div
              style={{
                position: 'absolute',
                left: confTable.x * CELL + 4,
                top: confTable.y * CELL + 4,
                width: confTable.w * CELL - 8,
                height: confTable.h * CELL - 8,
                background: 'rgba(168,85,247,0.1)',
                border: '1px solid rgba(168,85,247,0.3)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="text-xs text-purple-400">Build Council</span>
            </div>

            {/* Agent avatars */}
            {agents.map((agent, i) => (
              <div
                key={agent.name}
                style={{
                  position: 'absolute',
                  left: positions[i].x * CELL + CELL / 2 - 14,
                  top: positions[i].y * CELL + CELL / 2 - 14,
                  transition: 'left 1s ease, top 1s ease',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: agent.color,
                    border: `2px solid ${agent.status === 'working' ? '#22c55e' : '#eab308'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                  title={`${agent.name}: ${agent.task}`}
                >
                  {agent.name[0]}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 9,
                    color: 'white',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  {agent.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Panel */}
        <div className="w-64 border-l border-white/10 p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Live Activity</h3>
          <div className="space-y-2">
            {agents
              .filter(a => a.status === 'working')
              .map(agent => (
                <div key={agent.name} className="text-xs">
                  <span style={{ color: agent.color }} className="font-medium">
                    {agent.name}
                  </span>
                  <span className="text-gray-400"> — {agent.task}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom agent status bar */}
      <div className="flex gap-2 p-3 border-t border-white/10 overflow-x-auto">
        {agents.map(agent => (
          <div
            key={agent.name}
            className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/10 text-xs whitespace-nowrap"
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: agent.status === 'working' ? '#22c55e' : '#eab308' }}
            />
            <span className="text-gray-300">{agent.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
