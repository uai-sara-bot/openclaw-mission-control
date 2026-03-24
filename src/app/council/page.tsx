'use client'

import { useState } from 'react'
import { Send, Loader2, Sparkles } from 'lucide-react'

interface ModelResponse {
  model: string
  color: string
  bgColor: string
  borderColor: string
  avatar: string
  response: string
}

const mockResponses: Record<string, ModelResponse[]> = {
  default: [
    {
      model: 'Claude',
      color: 'text-orange-300',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      avatar: 'C',
      response: "I'll approach this systematically. The key considerations here are: (1) understanding the underlying intent, (2) evaluating tradeoffs between approaches, and (3) recommending a clear path forward. Based on my analysis, the most pragmatic solution balances immediate needs with long-term maintainability. I'd lean toward the incremental approach — ship something that works, then iterate based on real feedback."
    },
    {
      model: 'GPT',
      color: 'text-green-300',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      avatar: 'G',
      response: "Great question. Let me break this down: First, consider your constraints — time, resources, and complexity tolerance. Second, think about reversibility — can you easily undo this decision? Third, evaluate the blast radius if things go wrong. My recommendation: start with the simplest solution that could possibly work. You can always add complexity later, but you can't take it away without pain."
    },
    {
      model: 'Gemini',
      color: 'text-blue-300',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      avatar: 'G',
      response: "Interesting framing. I'd add a perspective often overlooked: the human factors. The technically superior solution often fails if the team can't maintain it, or if it requires too much context to understand. Consider the cognitive load on future-you. Also worth noting: the industry trend is moving toward [relevant approach] — aligning with that gives you access to more tooling and community support over time."
    },
    {
      model: 'Qwen (Local)',
      color: 'text-purple-300',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      avatar: 'Q',
      response: "From a local/efficiency perspective: this can be solved with significantly less overhead than the other models suggest. Key insight: 80% of the value comes from 20% of the implementation. Focus on the core loop first. For the specific technical question, I\'d prioritize: latency < cost < completeness. You can compress and optimize later. Ship fast, measure, iterate."
    },
  ]
}

const samplePrompts = [
  "What's the best architecture for a multi-agent system?",
  "Should I use Supabase or PlanetScale for this project?",
  "How do I reduce AI inference costs by 50%?",
  "What's the most important thing to focus on for an AI SaaS?",
]

export default function CouncilPage() {
  const [prompt, setPrompt] = useState('')
  const [responses, setResponses] = useState<ModelResponse[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>(null)

  const handleSend = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResponses(null)
    // Simulate API delay
    await new Promise(r => setTimeout(r, 2200))
    setResponses(mockResponses.default)
    setLoading(false)
  }

  const handleSample = (p: string) => {
    setPrompt(p)
  }

  return (
    <div className="p-6 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} className="text-teal-400" />
          <h1 className="text-2xl font-bold text-white">Council</h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Ask all models simultaneously and compare perspectives
        </p>
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <div className="flex gap-3">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend() }}
            placeholder="Ask all models..."
            rows={3}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors self-start"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? 'Sending...' : 'Send to Council'}
          </button>
        </div>
      </div>

      {/* Sample prompts */}
      {!responses && !loading && (
        <div className="mb-6">
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Try a sample:</p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map(p => (
              <button
                key={p}
                onClick={() => handleSample(p)}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:border-teal-500/40 hover:text-teal-300 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-8 text-center">
          <Loader2 size={32} className="animate-spin text-teal-400 mx-auto mb-3" />
          <p className="text-white font-medium">Models discussing...</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Claude · GPT · Gemini · Qwen are thinking</p>
        </div>
      )}

      {/* Responses */}
      {responses && (
        <>
          {/* Active question */}
          <div className="mb-5 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Your question</p>
            <p className="text-sm text-white">{prompt}</p>
          </div>

          {/* Model tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab(null)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${!activeTab ? 'bg-teal-500/20 text-teal-300' : 'text-white/50 hover:text-white/80'}`}
            >
              All Models
            </button>
            {responses.map(r => (
              <button
                key={r.model}
                onClick={() => setActiveTab(r.model === activeTab ? null : r.model)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${activeTab === r.model ? `${r.bgColor} ${r.color}` : 'text-white/50 hover:text-white/80'}`}
              >
                {r.model}
              </button>
            ))}
          </div>

          {/* Response cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {responses
              .filter(r => !activeTab || r.model === activeTab)
              .map(r => (
                <div
                  key={r.model}
                  className={`rounded-xl border p-5 ${r.borderColor} ${r.bgColor}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${r.bgColor} ${r.color} border ${r.borderColor}`}>
                      {r.avatar}
                    </div>
                    <span className={`font-semibold text-sm ${r.color}`}>{r.model}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {r.response}
                  </p>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}
