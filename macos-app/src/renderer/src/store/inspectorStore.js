import { create } from 'zustand'

export const METRIC_ENCYCLOPEDIA = {
  beneish_m_score: {
    title: 'Beneish M-Score (Earnings Manipulation Model)',
    category: 'Forensic Accounting',
    tagColor: 'amber',
    formula: 'M = -4.84 + 0.920·DSRI + 0.528·GMI + 0.404·AQI + 0.892·SGI + 0.115·DEPI - 0.172·SGAI + 4.037·TATA + 0.0327·LVGI',
    thresholds: [
      { condition: 'M ≤ -1.78', label: 'CLEAN / SAFE', color: 'green', desc: 'Low probability of earnings manipulation or aggressive revenue recognition.' },
      { condition: 'M > -1.78', label: 'FLAGGED / AT RISK', color: 'red', desc: 'Statistically elevated probability of financial statement manipulation.' },
    ],
    explanation: 'Created by Prof. Messod Beneish, this 8-variable quantitative model identifies companies likely to be artificially inflating revenue, understating expenses, or shifting future earnings.',
    institutionalGuide: 'Institutional fund managers reject or penalize companies with M-Score > -1.78 because historical backtests show that flagged companies underperform benchmarks by over 12% annually.',
    variables: [
      { name: 'DSRI (Days Sales in Receivables Index)', desc: 'Measures whether receivables are growing faster than revenues (premature revenue booking).' },
      { name: 'GMI (Gross Margin Index)', desc: 'Detects deteriorating gross margins, a common driver of accounting pressure.' },
      { name: 'AQI (Asset Quality Index)', desc: 'Identifies capitalization of operating expenses into non-current assets.' },
      { name: 'SGI (Sales Growth Index)', desc: 'High growth firms face severe incentive pressures to maintain momentum.' },
      { name: 'TATA (Total Accruals to Total Assets)', desc: 'Examines divergence between accounting Net Income and actual Operating Cash Flow.' },
    ],
  },

  altman_z_score: {
    title: "Altman Z''-Score (Emerging Market Solvency Model)",
    category: 'Credit & Solvency',
    tagColor: 'blue',
    formula: "Z'' = 6.56·X1 + 3.26·X2 + 6.72·X3 + 1.05·X4",
    thresholds: [
      { condition: "Z'' > 2.60", label: 'SAFE ZONE', color: 'green', desc: 'Robust liquidity, solid retained earnings, and low insolvency risk.' },
      { condition: "1.10 ≤ Z'' ≤ 2.60", label: 'GREY ZONE', color: 'amber', desc: 'Moderate credit risk; warrants debt service coverage monitoring.' },
      { condition: "Z'' < 1.10", label: 'DISTRESS ZONE', color: 'red', desc: 'Substantial bankruptcy or default vulnerability within 24 months.' },
    ],
    explanation: "Edward Altman's 4-variable Z''-Score model is specifically adapted for emerging markets, non-manufacturers, and service corporations without requiring public equity market cap distortions.",
    institutionalGuide: 'Credit desks and long-only funds use the Z-Score to filter out insolvency traps. A score below 1.10 mandates a hard stop or hedging against corporate credit degradation.',
    variables: [
      { name: 'X1 (Working Capital / Total Assets)', desc: 'Measures net liquid assets relative to firm size.' },
      { name: 'X2 (Retained Earnings / Total Assets)', desc: 'Reflects cumulative profitability and age of firm.' },
      { name: 'X3 (EBIT / Total Assets)', desc: 'True asset productivity unburdened by tax or leverage.' },
      { name: 'X4 (Book Value of Equity / Total Liabilities)', desc: 'Capital cushion available before liabilities exceed assets.' },
    ],
  },

  piotroski_f_score: {
    title: 'Piotroski 9-Point F-Score (Fundamental Quality)',
    category: 'Fundamental Quality',
    tagColor: 'green',
    formula: 'F = Σ (Profitability [4 pts] + Leverage & Liquidity [3 pts] + Operating Efficiency [2 pts])',
    thresholds: [
      { condition: 'F = 8–9', label: 'VERY STRONG QUALITY', color: 'green', desc: 'Top decile operational performance across all metrics.' },
      { condition: 'F = 5–7', label: 'STABLE / AVERAGE', color: 'blue', desc: 'Sound operational metrics with minor areas of stagnation.' },
      { condition: 'F ≤ 4', label: 'WEAK / DETERIORATING', color: 'red', desc: 'Fundamental quality is deteriorating; high turnover risk.' },
    ],
    explanation: 'Designed by Stanford Professor Joseph Piotroski, this 9-criteria binary checklist evaluates continuous improvement in profitability, cash flow generation, leverage reduction, and asset turnover.',
    institutionalGuide: 'Piotroski F-Score is widely used as an institutional quality filter in Smart Beta ETFs. Pairing value stocks (low P/B) with high F-Scores (≥7) historically eliminates 70% of value traps.',
    variables: [
      { name: 'Profitability (4 pts)', desc: 'Positive ROA, Positive Operating Cash Flow, YoY ROA Growth, and Cash Flow > Net Income (Accrual Quality).' },
      { name: 'Leverage & Liquidity (3 pts)', desc: 'YoY Debt/Equity Reduction, Current Ratio Expansion, Zero Dilutive Share Issuance.' },
      { name: 'Operating Efficiency (2 pts)', desc: 'Gross Margin Expansion and Asset Turnover Growth.' },
    ],
  },

  rrg_sector_matrix: {
    title: 'Relative Rotation Graph (RRG) Matrix',
    category: 'Quantitative Momentum',
    tagColor: 'purple',
    formula: 'RS-Ratio = 100 + ( (Price_sector / Benchmark) - SMA(RS) ) / StdDev(RS) \nRS-Momentum = 100 + ( RS-Ratio - SMA(RS-Ratio) ) / StdDev(RS-Ratio)',
    thresholds: [
      { condition: 'LEADING (Top Right)', label: 'RS-Ratio > 100 & RS-Mom > 100', color: 'green', desc: 'Outperforming benchmark and accelerating. Primary alpha source.' },
      { condition: 'WEAKENING (Bottom Right)', label: 'RS-Ratio > 100 & RS-Mom < 100', color: 'amber', desc: 'Outperforming but losing momentum. Harvest profits / tighten trailing stops.' },
      { condition: 'LAGGING (Bottom Left)', label: 'RS-Ratio < 100 & RS-Mom < 100', color: 'red', desc: 'Underperforming and decelerating. Avoid long exposures / potential shorts.' },
      { condition: 'IMPROVING (Top Left)', label: 'RS-Ratio < 100 & RS-Mom > 100', color: 'blue', desc: 'Underperforming but gaining velocity. Early turnaround candidate.' },
    ],
    explanation: 'Relative Rotation Graphs (developed by Julius de Kempenaer) visualize the relative strength trend (X-axis) and velocity (Y-axis) of sector indices against the NIFTY 50 benchmark on a 2D plane.',
    institutionalGuide: 'Sector rotation drives over 60% of equity portfolio returns. Systematic managers allocate capital towards stocks residing in LEADING and IMPROVING sectors to gain institutional tailwinds.',
  },

  volatility_risk_parity: {
    title: 'ATR Volatility Risk-Parity Sizing',
    category: 'Risk Management',
    tagColor: 'amber',
    formula: 'Dollar_Risk = Account_Capital × Risk_Budget_Pct \nVol_Stop_Distance = ATR_14 × 1.5 \nOptimal_Shares = Dollar_Risk / Vol_Stop_Distance',
    thresholds: [
      { condition: 'Risk Budget: 1.0% - 2.0%', label: 'CONSERVATIVE / PRUDENT', color: 'green', desc: 'Prevents catastrophic drawdown even during 10 consecutive loss streaks.' },
      { condition: 'Single Stock Cap: ≤ 25%', label: 'MAX ALLOCATION CEILING', color: 'blue', desc: 'Limits concentration risk in single names.' },
    ],
    explanation: 'Volatility Risk Parity calculates position sizing such that every trade contributes an equal dollar risk to the portfolio, regardless of whether the asset is highly volatile or stable.',
    institutionalGuide: 'By sizing inversely to volatility (wider stops get smaller share counts), hedge funds eliminate the risk of a single high-beta stock dominating portfolio drawdown.',
  },

  half_kelly: {
    title: 'Half-Kelly Capital Allocation Criterion',
    category: 'Quantitative Growth',
    tagColor: 'green',
    formula: 'f* = [ (p · b - q) / b ] × 0.5 \nWhere: p = Win Rate, q = (1 - p), b = Win/Loss Payoff Ratio',
    thresholds: [
      { condition: 'Half-Kelly (0.5x)', label: 'OPTIMAL GROWTH', color: 'green', desc: '75% of full Kelly growth rate with 50% lower volatility and drastically reduced drawdown.' },
    ],
    explanation: 'The Kelly Criterion determines the theoretically optimal fraction of capital to risk on a series of positive-expectancy bets. In financial markets, Full-Kelly is notoriously volatile, so professional quantitative desks universally use Half-Kelly (0.5x).',
    institutionalGuide: 'Prevents over-allocation when strategy win rates are elevated. Provides geometric growth while insulating account capital from variance spikes.',
  },

  governance_red_flags: {
    title: 'Indian Corporate Governance & Red Flag Auditing',
    category: 'Forensic Risk',
    tagColor: 'red',
    formula: 'Pledge_Ratio = Pledged_Promoter_Shares / Total_Promoter_Shares \nInterest_Coverage = EBIT / Finance_Costs',
    thresholds: [
      { condition: 'Promoter Pledge > 20%', label: 'CRITICAL HAZARD', color: 'red', desc: 'High margin call liquidation hazard if stock corrects.' },
      { condition: 'Promoter Pledge 10%–20%', label: 'MODERATE CAUTION', color: 'amber', desc: 'Requires continuous tracking of collateral buffer.' },
      { condition: 'Interest Coverage < 2.0x', label: 'DEBT STRESS', color: 'red', desc: 'Operating earnings insufficient to comfortably service interest burden.' },
    ],
    explanation: 'Indian market governance forensic screeners check for promoter share encumbrances, circular transactions, related-party debt guarantees, and rapid auditor resignations.',
    institutionalGuide: 'Stocks with promoter pledges exceeding 20% frequently suffer cascading flash crashes when NBFCs and mutual funds dump pledged collateral into illiquid markets.',
  },

  smart_funnel_pipeline: {
    title: '3-Stage Institutional Smart Funnel',
    category: 'AI Pipeline',
    tagColor: 'purple',
    formula: 'Stage 1 (0-Token Quant Filter) → Stage 2 (Macro & Sector RRG Context) → Stage 3 (Adversarial Debate & Synthesis)',
    thresholds: [
      { condition: 'Score ≥ 70/100', label: 'QUALIFIED CANDIDATE', color: 'green', desc: 'Passed RSI, Moving Averages, Sector RRG tailwind, and Forensic screens.' },
      { condition: 'Score < 70/100', label: 'FILTERED / ELIMINATED', color: 'red', desc: 'Disqualified deterministically without consuming LLM inference tokens.' },
    ],
    explanation: 'An institutional funnel architecture that screens hundreds of NSE/BSE stocks through fast quantitative filters, macro alignment, and multi-agent debates between Bull and Bear specialists before producing a synthesized trade plan.',
    institutionalGuide: 'Combines algorithmic precision (zero hallucinations in metrics) with LLM deep synthesis, ensuring only high-conviction trades reach execution.',
  },
}

export const useInspectorStore = create((set) => ({
  isOpen: false,
  activeMetric: null,
  contextData: null,

  openInspector: (metricKeyOrConfig, contextData = null) => {
    if (typeof metricKeyOrConfig === 'string') {
      const predefined = METRIC_ENCYCLOPEDIA[metricKeyOrConfig] || {
        title: metricKeyOrConfig.replace(/_/g, ' ').toUpperCase(),
        category: 'Market Metric',
        explanation: 'Institutional indicator used for financial and quantitative analysis.',
        institutionalGuide: 'Analyze in confluence with price action and risk parameters.',
      }
      set({
        isOpen: true,
        activeMetric: { key: metricKeyOrConfig, ...predefined },
        contextData,
      })
    } else {
      set({
        isOpen: true,
        activeMetric: metricKeyOrConfig,
        contextData,
      })
    }
  },

  closeInspector: () => set({ isOpen: false, activeMetric: null, contextData: null }),
}))
