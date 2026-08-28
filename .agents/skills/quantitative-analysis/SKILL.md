---
name: quantitative-analysis
description: >-
  Quantitative analysis workflows in india-trade-cli, including RRG (Relative Rotation Graph)
  sector momentum, Forensic accounting audits (Beneish M-Score, Altman Z-Score, Piotroski F-Score),
  and volatility risk-parity position sizing with Indian F&O contract lot quantization.
---

# Quantitative Analysis & Risk Engine Runbook

## 1. Relative Rotation Graph (RRG) Sector Momentum

The RRG engine ([`analysis/sector_rotation.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/analysis/sector_rotation.py)) models sector rotation across 10 major NSE sectors relative to NIFTY 50:

- **JdK RS-Ratio (Trend)**: Rolling relative strength normalized to 100 baseline ($>100$ = outperforming).
- **JdK RS-Momentum (Velocity)**: Rate of change of RS-Ratio ($>100$ = accelerating).
- **Quadrants**:
  - `LEADING`: RS-Ratio $\ge 100$, RS-Momentum $\ge 100$ (Strong uptrend, high momentum).
  - `WEAKENING`: RS-Ratio $\ge 100$, RS-Momentum $< 100$ (Trend positive but decelerating).
  - `LAGGING`: RS-Ratio $< 100$, RS-Momentum $< 100$ (Underperforming benchmark).
  - `IMPROVING`: RS-Ratio $< 100$, RS-Momentum $\ge 100$ (Early recovery phase).
- **Usage**:
  ```python
  from analysis.sector_rotation import get_sector_rrg_matrix, get_stock_sector_alignment

  # Get matrix of all 10 NSE sectors
  matrix = get_sector_rrg_matrix()

  # Check specific stock alignment
  alignment = get_stock_sector_alignment("INFY")
  # Returns: {"symbol": "INFY", "sector": "IT", "quadrant": "LEADING", "tailwind_score": 85, "alignment": "STRONG_TAILWIND"}
  ```

---

## 2. Forensic Accounting & Corporate Governance Audit

The forensic auditor ([`analysis/forensic.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/analysis/forensic.py)) screens for balance sheet distress and earnings manipulation:

1. **Beneish M-Score (8-Variable Model)**:
   - $M > -1.78$: High probability of earnings manipulation.
   - Variables: Days Sales in Receivables (DSRI), Gross Margin (GMI), Asset Quality (AQI), Sales Growth (SGI), Depreciation (DEPI), SGA Expenses (SGAI), Leverage (LVGI), Total Accruals to Total Assets (TATA).
2. **Altman Z''-Score (Emerging Market Model)**:
   - $Z'' > 2.60$: **SAFE** credit zone.
   - $1.10 \le Z'' \le 2.60$: **GREY** zone.
   - $Z'' < 1.10$: **DISTRESS** / high bankruptcy probability.
3. **Piotroski 9-Point F-Score**:
   - 8–9: High Quality | 4–7: Average | 0–3: Weak Quality.
4. **Governance Red Flag Checks**:
   - Promoter share pledge $>10\%$ (warning) and $>20\%$ (critical margin call risk).
   - Low interest coverage ($<2.0\text{x}$).
   - High financial leverage ($D/E > 2.2\text{x}$).
   - Accruals divergence (Negative operating cash flow with positive net income).
- **Usage**:
  ```python
  from analysis.forensic import audit_forensics

  report = audit_forensics("RELIANCE")
  # report.quality_rating -> "A+" | "A" | "B" | "C" | "D"
  # report.beneish_m_score, report.altman_z_score, report.piotroski_f_score
  # report.governance_red_flags -> list[str]
  ```

---

## 3. Institutional Position Sizing & Risk-Parity

The sizing engine ([`engine/position_sizer.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/position_sizer.py)) computes risk-calibrated position sizes:

- **Sizing Models**:
  - `atr_volatility`: Equalizes risk based on asset volatility ($1.5 \times \text{ATR}$ volatility stop).
  - `fixed_fractional`: Direct stop distance risk sizing.
  - `half_kelly`: Kelly criterion growth formula scaled by 0.5 for stability.
- **F&O Contract Lot Quantization**: Automatically rounds shares to standard Indian derivative lot sizes (NIFTY 25, BANKNIFTY 15, FINNIFTY 25, MIDCPNIFTY 50, equity lots).
- **Usage**:
  ```python
  from engine.position_sizer import calculate_position_size

  size = calculate_position_size(
      symbol="INFY",
      entry_price=1500.0,
      stop_loss=1470.0,
      capital=200000.0,
      max_risk_pct=1.5,
      sizing_model="atr_volatility",
  )
  # size.shares, size.lots, size.capital_allocated, size.risk_amount
  ```

---

## 4. Testing & Verification

```powershell
# Run quantitative and forensic test suites
.venv\Scripts\pytest.exe tests/test_sector_rotation.py tests/test_forensic.py tests/test_position_sizer.py -v
```
