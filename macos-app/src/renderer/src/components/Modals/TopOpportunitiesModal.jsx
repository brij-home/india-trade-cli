import { useState, useEffect } from 'react'
import { useAPI } from '../../hooks/useAPI'
import HighConvictionCard from '../Cards/HighConvictionCard'

const DEFAULT_CATEGORIES = [
  { id: 'auto_market_aware', name: '⚡ Dynamic Auto-Hunting (Leading Sectors)', type: 'THEMATIC' },
  { id: 'most_liquid_today', name: '💧 High Liquidity (Top Turnover)', type: 'THEMATIC' },
  { id: 'volume_surges_rvol', name: '🚀 Unusual Volume Surges (RVOL > 1.5x)', type: 'THEMATIC' },
  { id: 'multibagger_hunters', name: '💎 Multibagger Compounders', type: 'THEMATIC' },
  { id: 'nifty50', name: '🏆 NIFTY 50 Bluechips', type: 'THEMATIC' },
  { id: 'banking', name: '🏦 Banking & Financial Services', type: 'SECTOR' },
  { id: 'it', name: '💻 IT & Technology', type: 'SECTOR' },
  { id: 'auto', name: '🚗 Automobiles & EV', type: 'SECTOR' },
  { id: 'defence', name: '🛡️ Defence & Aerospace', type: 'SECTOR' },
  { id: 'energy', name: '⚡ Energy & Power Renewables', type: 'SECTOR' },
  { id: 'metals', name: '⛏️ Metals & Mining', type: 'SECTOR' },
  { id: 'pharma', name: '💊 Pharma & Healthcare', type: 'SECTOR' },
  { id: 'fmcg', name: '🛒 FMCG & Retail', type: 'SECTOR' },
  { id: 'infra', name: '🏗️ Real Estate & Infra', type: 'SECTOR' },
  { id: 'chemicals', name: '🧪 Specialty Chemicals', type: 'SECTOR' },
  { id: 'telecom', name: '📡 Telecom & Logistics', type: 'SECTOR' },
]

export default function TopOpportunitiesModal({ isOpen, onClose }) {
  const [data, setData] = useState(null)
  const [universe, setUniverse] = useState('auto_market_aware')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [isScanning, setIsScanning] = useState(false)
  const { call, get } = useAPI()

  // Load universe taxonomy from backend
  useEffect(() => {
    if (isOpen) {
      get('/skills/universe_categories')
        .then((res) => {
          if (res?.data?.categories) {
            setCategories(res.data.categories)
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  const fetchOpportunities = async (targetUniverse = universe, refresh = false) => {
    setIsScanning(true)
    try {
      const res = await call('/skills/top_conviction', {
        universe: targetUniverse,
        top_n: 10,
        refresh: refresh,
      })
      setData(res.data ?? res)
    } catch (err) {
      console.error('Failed to load top conviction opportunities:', err)
    } finally {
      setIsScanning(false)
    }
  }

  // Fetch when opened or when universe changes
  useEffect(() => {
    if (isOpen) {
      fetchOpportunities(universe, false)
    }
  }, [isOpen, universe])

  // ESC to close
  useEffect(() => {
    function onKeyDown(e) {
      if (isOpen && e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const thematics = categories.filter((c) => c.type === 'THEMATIC')
  const sectors = categories.filter((c) => c.type === 'SECTOR')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-ui">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border bg-panel flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <span>Market-Aware Opportunity Cockpit</span>
                <span className="text-xs bg-amber/15 text-amber border border-amber/30 px-2 py-0.5 rounded font-mono font-semibold">
                  Zero-Token Radar
                </span>
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Top-down sector momentum routing + liquidity-gated multi-pillar ranking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Structured Category Dropdown */}
            <select
              value={universe}
              onChange={(e) => {
                const u = e.target.value
                setUniverse(u)
              }}
              className="bg-elevated border border-border text-text text-xs rounded-lg px-2.5 py-1.5 font-mono outline-none cursor-pointer"
            >
              <optgroup label="⚡ Dynamic Strategies & Presets">
                {thematics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏢 Institutional Sectors (250+ Equities)">
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon || '🏢'} {s.name} ({s.count} stocks)
                  </option>
                ))}
              </optgroup>
            </select>

            {/* Refresh Live Button */}
            <button
              onClick={() => fetchOpportunities(universe, true)}
              disabled={isScanning}
              className="flex items-center gap-1.5 bg-elevated hover:bg-panel border border-border/80 hover:border-amber/50 px-3 py-1.5 rounded-lg text-xs font-semibold text-text transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className={isScanning ? 'animate-spin' : ''}>🔄</span>
              <span>{isScanning ? 'Scanning…' : 'Scan Live'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-muted hover:text-text p-1.5 rounded-lg hover:bg-elevated text-lg transition-colors cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Thematic Pill Selector */}
        <div className="flex items-center gap-1.5 px-6 py-2 border-b border-border/40 bg-panel/60 overflow-x-auto text-xs flex-shrink-0">
          {[
            { id: 'auto_market_aware', label: '⚡ Auto (Leading Sectors)' },
            { id: 'most_liquid_today', label: '💧 High Liquidity' },
            { id: 'volume_surges_rvol', label: '🚀 Volume Surges' },
            { id: 'defence', label: '🛡️ Defence' },
            { id: 'auto', label: '🚗 Auto/EV' },
            { id: 'it', label: '💻 IT' },
            { id: 'banking', label: '🏦 Banking' },
            { id: 'multibagger_hunters', label: '💎 Multibaggers' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setUniverse(pill.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer flex-shrink-0 ${
                universe === pill.id
                  ? 'bg-amber text-black font-bold shadow-xs'
                  : 'bg-elevated/70 hover:bg-elevated text-muted hover:text-text border border-border/40'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isScanning && !data ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <span className="text-3xl animate-spin">⏳</span>
              <p className="text-sm font-semibold text-text">Performing top-down sector analysis & liquidity screening…</p>
              <p className="text-xs text-muted">Evaluating structure, volume footprints & Minervini Stage 2 across leading equities.</p>
            </div>
          ) : data ? (
            <HighConvictionCard data={data} />
          ) : (
            <div className="p-8 text-center text-muted text-sm">
              Unable to load opportunities. Click Scan Live to try again.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
