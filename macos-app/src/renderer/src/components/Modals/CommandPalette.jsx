import { useState, useEffect, useRef } from 'react'
import { useChatStore } from '../../store/chatStore'

const POPULAR_SYMBOLS = [
  { symbol: 'NIFTY50', name: 'NIFTY 50 Index', type: 'Index' },
  { symbol: 'BANKNIFTY', name: 'NIFTY Bank Index', type: 'Index' },
  { symbol: 'FINNIFTY', name: 'NIFTY Financial Services', type: 'Index' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', type: 'Energy' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', type: 'Banking' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', type: 'IT' },
  { symbol: 'INFY', name: 'Infosys Ltd', type: 'IT' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', type: 'Banking' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', type: 'Auto' },
  { symbol: 'SBIN', name: 'State Bank of India', type: 'PSU Bank' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', type: 'Telecom' },
  { symbol: 'ITC', name: 'ITC Ltd', type: 'FMCG' },
  { symbol: 'LT', name: 'Larsen & Toubro', type: 'Infra' },
]

const QUICK_ACTIONS = [
  { label: 'Morning Market Brief & Macro Posture', cmd: 'brief', icon: '🌅', cat: 'Intelligence' },
  { label: 'High-Probability Big Move Predictor (NIFTY)', cmd: 'bigmove NIFTY', icon: '🚀', cat: 'Prediction' },
  { label: 'Top 10 High-Conviction Opportunity Radar', cmd: 'radar', icon: '🎯', cat: 'Screening' },
  { label: 'Smart Funnel Multi-Agent Screening (NIFTY 50)', cmd: 'funnel nifty_50', icon: '🎯', cat: 'Screening' },
  { label: 'Market Structure & Smart Money Concepts (RELIANCE)', cmd: 'structure RELIANCE', icon: '🏛️', cat: 'Price Action' },
  { label: 'Multibagger & Minervini Trend Template (TRENT)', cmd: 'multibagger TRENT', icon: '💎', cat: 'Positional' },
  { label: 'Sector Relative Rotation Graph (RRG Matrix)', cmd: 'rrg', icon: '🌐', cat: 'Quant' },
  { label: 'Forensic Accounting & Governance Audit (RELIANCE)', cmd: 'forensic RELIANCE', icon: '🛡️', cat: 'Forensic' },
  { label: 'Position Lifecycle & Dynamic Trailing SL (RELIANCE)', cmd: 'lifecycle RELIANCE 2400 2340', icon: '📡', cat: 'Management' },
  { label: 'Volatility Risk-Parity & Position Sizer (NIFTY)', cmd: 'size NIFTY 24000 23600', icon: '⚖️', cat: 'Risk' },
  { label: 'FII / DII Institutional Flows & Signals', cmd: 'flows', icon: '🌊', cat: 'Intelligence' },
  { label: 'Options Open Interest Profile (NIFTY)', cmd: 'oi NIFTY', icon: '📊', cat: 'Options' },
  { label: 'Multi-Leg Strategy Payoff Simulator', cmd: 'payoff NIFTY', icon: '🎯', cat: 'Options' },
  { label: 'Live Market Scanner & Heatmap', cmd: 'scan', icon: '🔍', cat: 'Screening' },
  { label: 'Institutional Risk & Greeks Report', cmd: 'risk-report', icon: '🛡️', cat: 'Risk' },
  { label: 'View Active Holdings & Portfolio Margin', cmd: 'holdings', icon: '💼', cat: 'Portfolio' },
  { label: 'Backtest Strategy (RELIANCE rsi)', cmd: 'backtest RELIANCE rsi', icon: '🧪', cat: 'Quant' },
]


export default function CommandPalette({ isOpen, onClose, onOpenOrderTicket }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const setDraft = useChatStore((s) => s.setDraft)
  const inputRef = useRef(null)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Filter actions and symbols
  const filteredActions = QUICK_ACTIONS.filter(
    (a) => a.label.toLowerCase().includes(query.toLowerCase()) || a.cmd.toLowerCase().includes(query.toLowerCase())
  )

  const filteredSymbols = POPULAR_SYMBOLS.filter(
    (s) => s.symbol.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase())
  )

  const allItems = [
    ...filteredActions.map((a) => ({ type: 'action', ...a })),
    ...filteredSymbols.map((s) => ({ type: 'symbol', ...s })),
  ]

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((idx) => (idx + 1) % (allItems.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((idx) => (idx - 1 + (allItems.length || 1)) % (allItems.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = allItems[selectedIndex]
      if (item) selectItem(item)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const selectItem = (item) => {
    if (item.type === 'action') {
      setDraft(item.cmd)
    } else if (item.type === 'symbol') {
      setDraft(`analyze ${item.symbol}`)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-xs p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-panel border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl font-ui"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60 bg-panel/30">
          <span className="text-amber text-base">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, tool, or NSE stock name… (e.g. RELIANCE, brief, oi)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-text text-sm font-ui placeholder:text-muted"
          />
          <kbd className="hidden sm:inline text-[10px] bg-panel border border-border px-1.5 py-0.5 rounded text-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredActions.length > 0 && (
            <div>
              <p className="text-muted text-[10px] uppercase font-ui tracking-wider px-2 py-1">Quick Actions</p>
              {filteredActions.map((action, idx) => {
                const isSelected = selectedIndex === idx
                return (
                  <button
                    key={action.cmd}
                    onClick={() => selectItem({ type: 'action', ...action })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isSelected ? 'bg-amber/15 text-text border border-amber/30' : 'text-text hover:bg-panel/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{action.icon}</span>
                      <span className="font-semibold">{action.label}</span>
                    </div>
                    <code className="text-[10px] text-amber bg-panel px-1.5 py-0.5 rounded font-mono border border-border/50">
                      {action.cmd}
                    </code>
                  </button>
                )
              })}
            </div>
          )}

          {filteredSymbols.length > 0 && (
            <div className="pt-2 border-t border-border/30">
              <p className="text-muted text-[10px] uppercase font-ui tracking-wider px-2 py-1">Popular Equities &amp; Indices</p>
              {filteredSymbols.map((sym, idx) => {
                const actualIdx = filteredActions.length + idx
                const isSelected = selectedIndex === actualIdx
                return (
                  <button
                    key={sym.symbol}
                    onClick={() => selectItem({ type: 'symbol', ...sym })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      isSelected ? 'bg-amber/15 text-text border border-amber/30' : 'text-text hover:bg-panel/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-amber">{sym.symbol}</span>
                      <span className="text-muted text-[11px]">{sym.name}</span>
                    </div>
                    <span className="text-[10px] text-muted bg-panel px-1.5 py-0.5 rounded border border-border/50">
                      {sym.type}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {allItems.length === 0 && (
            <div className="p-6 text-center text-muted text-xs font-ui">
              No matching commands or stocks found. Press <kbd className="text-amber">Enter</kbd> to ask the multi-agent AI directly.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/40 bg-panel/40 flex items-center justify-between text-[10px] text-muted font-ui">
          <span>Navigate with <kbd className="bg-panel px-1 rounded border border-border">↑</kbd> <kbd className="bg-panel px-1 rounded border border-border">↓</kbd></span>
          <span>Select with <kbd className="bg-panel px-1 rounded border border-border">↵ Enter</kbd></span>
        </div>
      </div>
    </div>
  )
}
