---
name: backtesting
description: >-
  Develop, execute, and analyze quantitative trading strategies using the
  vectorized and event-driven backtesting engines in engine/, including
  options backtesting, market regime filtering, and performance reporting.
---

# Backtesting & Strategy Engine Runbook

## Engine Components

Under [`engine/`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/):

- **Vectorized Backtester** ([`engine/backtest_vectorized.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/backtest_vectorized.py)): Ultra-fast NumPy/Pandas array calculations for broad-market indicator sweeps.
- **Event-Driven Backtester** ([`engine/backtest.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/backtest.py)): Simulates tick/bar-by-bar execution, order slippage, broker commissions, and intraday stop-losses.
- **Options Backtester** ([`engine/options_backtest.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/options_backtest.py)): Implements Black-Scholes Greeks, IV decay, delta hedging, and multi-leg option strategies (Straddles, Strangles, Iron Condors).
- **Regime Detector** ([`engine/backtest_regime.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/backtest_regime.py)): Filters trade signals by macro market regimes (Trending Bull, Trending Bear, High Volatility Choppy, Low Volatility Rangebound).
- **Strategy Library** ([`engine/strategy_library.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/strategy_library.py)): Collection of pre-built technical, momentum, and mean-reversion strategies.

---

## Standard Backtest Workflow

1. **Define Strategy**:
   - Subclass `Strategy` or implement `generate_signals(df: pd.DataFrame) -> pd.Series`.
2. **Execute Backtest**:
   ```python
   from engine.backtest_vectorized import VectorizedBacktester
   from engine.strategy_library import EMACrossoverStrategy

   strategy = EMACrossoverStrategy(fast_period=9, slow_period=21)
   tester = VectorizedBacktester(strategy=strategy, initial_capital=200000)
   result = tester.run(symbol="INFY", df=ohlcv_df)
   ```
3. **Analyze Metrics**:
   - Total Return (%), CAGR (%)
   - Max Drawdown (MDD %) and Drawdown Duration
   - Sharpe Ratio, Sortino Ratio, Calmar Ratio
   - Win Rate (%) & Profit Factor

---

## Testing Backtest Modules

```powershell
# Run vectorized backtest tests
.venv\Scripts\pytest.exe tests/test_backtest_vectorized.py -v

# Run regime filter tests
.venv\Scripts\pytest.exe tests/test_backtest_regime.py -v

# Run options analytics and backtest tests
.venv\Scripts\pytest.exe tests/test_options_backtest.py -v
```
