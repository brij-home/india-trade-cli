import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../../store/chatStore'
import Message from './Message'

const QUICK_PROMPTS = [
  {
    icon: '⚡',
    title: 'Multi-Agent Stock Debate',
    desc: '7 quant agents analyze technicals, fundamentals & trade plans.',
    cmd: 'analyze RELIANCE',
  },
  {
    icon: '🎯',
    title: 'Options Strategy Payoff',
    desc: 'Interactive multi-leg simulator with live Greeks & DTE sliders.',
    cmd: 'payoff NIFTY',
  },
  {
    icon: '🔍',
    title: 'Sector Breadth & Scanner',
    desc: 'Live NSE sector heatmap and unusual volume/OI breakouts.',
    cmd: 'scan',
  },
  {
    icon: '🌊',
    title: 'Institutional Flow Radar',
    desc: 'Track FII vs DII net cash & Index Futures Long/Short positioning.',
    cmd: 'flows',
  },
  {
    icon: '🌅',
    title: 'Morning Market Brief',
    desc: 'Pre-market snapshot, global cues, VIX posture & macro events.',
    cmd: 'brief',
  },
  {
    icon: '🧪',
    title: 'Algorithmic Backtesting',
    desc: 'Test RSI, EMA, and Bollinger Bands with equity progression curves.',
    cmd: 'backtest RELIANCE rsi',
  },
]

const POPULAR_TICKERS = [
  { label: 'NIFTY 50', cmd: 'quote NIFTY50' },
  { label: 'BANKNIFTY', cmd: 'quote BANKNIFTY' },
  { label: 'RELIANCE', cmd: 'analyze RELIANCE' },
  { label: 'HDFCBANK', cmd: 'analyze HDFCBANK' },
  { label: 'TCS', cmd: 'analyze TCS' },
  { label: 'INFY', cmd: 'analyze INFY' },
  { label: 'TATAMOTORS', cmd: 'analyze TATAMOTORS' },
]

export default function ChatArea() {
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const sidecarError = useChatStore((s) => s.sidecarError)
  const port = useChatStore((s) => s.port)
  const setDraft = useChatStore((s) => s.setDraft)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5 bg-surface text-text">
      {/* Welcome Dashboard Empty State */}
      {messages.length === 0 && (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[75vh] py-8 text-center space-y-6">
          {/* Logo & Headline */}
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber/10 border border-amber/30 text-amber text-2xl shadow-sm mb-1">
              ◆
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-ui tracking-tight text-text">
              Institutional Trading &amp; AI Intelligence
            </h1>
            <p className="text-sm font-ui text-muted max-w-xl mx-auto leading-relaxed">
              Real-time Indian market analytics, multi-agent quant debates, options payoff simulation, and institutional flow tracking.
            </p>
          </div>

          {/* Quick Tickers Bar */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span className="text-xs text-muted font-ui mr-1">Trending:</span>
            {POPULAR_TICKERS.map((ticker) => (
              <button
                key={ticker.label}
                onClick={() => setDraft(ticker.cmd)}
                className="px-2.5 py-1 rounded-full text-xs font-mono bg-panel hover:bg-elevated text-text border border-border/80 hover:border-amber/50 transition-all cursor-pointer shadow-xs"
              >
                {ticker.label}
              </button>
            ))}
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full text-left pt-2">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.title}
                onClick={() => setDraft(item.cmd)}
                className="group relative p-4 rounded-xl bg-panel hover:bg-elevated border border-border/80 hover:border-amber/40 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl p-2 rounded-lg bg-surface border border-border/50">{item.icon}</span>
                    <span className="text-[10px] font-mono text-muted group-hover:text-amber transition-colors">
                      {item.cmd} ↗
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold font-ui text-text group-hover:text-amber transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted font-ui mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Status Note */}
          {sidecarError ? (
            <p className="text-red text-xs font-ui max-w-sm mt-4 bg-red/10 border border-red/20 px-3 py-1.5 rounded-lg">
              {sidecarError}
            </p>
          ) : (
            <p className="text-muted text-xs font-ui pt-2">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-panel border border-border font-mono text-amber font-semibold">Ctrl + K</kbd> to search any of the 2,000+ NSE stocks or commands.
            </p>
          )}
        </div>
      )}

      {/* Message list */}
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}

      {/* Loading indicator */}
      {isLoading && !messages.some((m) => m.cardType === 'streaming_analysis') && (
        <ThinkingIndicator />
      )}

      <div ref={bottomRef} />
    </div>
  )
}

function ThinkingIndicator() {
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const hint =
    secs > 15
      ? 'Running multi-agent analysis — synthesizing insights…'
      : secs > 5
      ? 'Calling quantitative AI reasoning agents…'
      : 'Computing institutional metrics…'

  return (
    <div className="flex items-center gap-3 bg-elevated border border-border rounded-xl px-4 py-3 max-w-sm shadow-md animate-fade-slide">
      <span className="text-amber animate-pulse text-lg">◆</span>
      <div>
        <p className="text-text text-sm font-ui font-medium">{hint}</p>
        <p className="text-muted text-xs font-mono mt-0.5">{secs}s elapsed</p>
      </div>
    </div>
  )
}
