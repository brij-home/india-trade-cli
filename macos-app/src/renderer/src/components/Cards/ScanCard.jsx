import { useEffect, useState } from 'react'
import { useAPI } from '../../hooks/useAPI'
import { useChatStore } from '../../store/chatStore'

function Section({ title, items, color, onSelect }) {
  if (!items?.length) return null
  return (
    <div>
      <p className={`text-[10px] uppercase tracking-widest font-ui mb-2 ${color}`}>{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => {
          const symbol = typeof item === 'string' ? item : item.symbol ?? item.tradingsymbol ?? JSON.stringify(item)
          const detail =
            typeof item === 'object'
              ? item.iv_rank != null
                ? `IV ${item.iv_rank}%`
                : item.oi_change != null
                ? `OI +${item.oi_change}%`
                : ''
              : ''
          return (
            <button
              key={i}
              onClick={() => onSelect?.(symbol)}
              className={`border rounded-lg px-2.5 py-1.5 transition-all hover:scale-102 cursor-pointer ${color
                .replace('text-', 'border-')
                .replace('500', '400')}/30 bg-panel hover:bg-elevated text-left`}
            >
              <span className={`text-[12px] font-mono font-semibold ${color}`}>{symbol}</span>
              {detail && <span className="text-[10px] font-ui text-muted ml-1.5">{detail}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ScanCard({ data }) {
  const d = data?.data ?? data ?? {}
  const summary = d.summary ?? d.scan_summary ?? null
  const { call } = useAPI()
  const setDraft = useChatStore((s) => s.setDraft)

  const [sectors, setSectors] = useState([])
  const [loadingSectors, setLoadingSectors] = useState(false)

  // Fetch live sector heatmap on mount
  useEffect(() => {
    let unmounted = false
    setLoadingSectors(true)
    const fetchSectors = async () => {
      try {
        const res = await call('/skills/sector_heatmap', {})
        const json = res?.data ?? res
        if (!unmounted && json?.sectors) {
          setSectors(json.sectors)
        }
      } catch (err) {
        console.error('Sector heatmap error:', err)
      } finally {
        if (!unmounted) setLoadingSectors(false)
      }
    }
    fetchSectors()
    return () => {
      unmounted = true
    }
  }, [])

  return (
    <div className="bg-elevated border border-border rounded-xl p-4 max-w-2xl w-full space-y-4 font-mono shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div>
          <p className="text-muted text-[10px] uppercase tracking-widest font-ui">Market Scanner &amp; Heatmap</p>
          <p className="text-text text-base font-semibold font-ui mt-0.5">NSE Breadth &amp; Breakouts</p>
        </div>
      </div>

      {summary && <p className="text-muted text-[12px] font-ui leading-relaxed">{summary}</p>}

      {/* Sector Breadth Heatmap Tiles */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-ui text-muted uppercase tracking-wider">
          <span>Sector Heatmap</span>
          {loadingSectors && <span>Refreshing…</span>}
        </div>

        {sectors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {sectors.map((sec) => {
              const chg = sec.change_pct ?? 0
              const isUp = chg >= 0
              return (
                <button
                  key={sec.code}
                  onClick={() => setDraft(`quote ${sec.code}`)}
                  className={`p-2 rounded-lg border text-left transition-all hover:scale-102 cursor-pointer ${
                    isUp
                      ? 'bg-green/10 border-green/30 text-green'
                      : 'bg-red/10 border-red/30 text-red'
                  }`}
                >
                  <p className="text-[11px] font-semibold font-ui truncate">{sec.name.replace('NIFTY ', '')}</p>
                  <p className="text-[12px] font-bold mt-0.5">
                    {isUp ? '+' : ''}
                    {chg.toFixed(2)}%
                  </p>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="bg-panel/40 border border-border/40 rounded-lg p-3 text-center text-muted text-xs font-ui">
            Loading sector metrics…
          </div>
        )}
      </div>

      {/* Technical & Options Breakouts */}
      <div className="space-y-3 pt-2 border-t border-border/40">
        <Section
          title="High Implied Volatility"
          items={d.high_iv}
          color="text-red"
          onSelect={(s) => setDraft(`analyze ${s}`)}
        />
        <Section
          title="Unusual Open Interest Spike"
          items={d.unusual_oi}
          color="text-amber"
          onSelect={(s) => setDraft(`oi ${s}`)}
        />
        <Section
          title="Strong Put Writing (Bullish Support)"
          items={d.high_put_writing}
          color="text-green"
          onSelect={(s) => setDraft(`analyze ${s}`)}
        />
        <Section
          title="Active Opportunities"
          items={d.opportunities ?? d.results}
          color="text-blue"
          onSelect={(s) => setDraft(`analyze ${s}`)}
        />
      </div>
    </div>
  )
}
