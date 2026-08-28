# AGENTS.md — india-trade-cli Agent Guidelines

> Operational handbook and architectural guidelines for AI agents working in the `india-trade-cli` codebase.

---

## 1. Project Context & High-Level Architecture

`india-trade-cli` is an institutional-grade, AI-powered multi-agent algorithmic trading, analysis, and backtesting platform for Indian financial markets (**NSE, BSE, NFO, MCX**).

### Component Map

| Directory | Responsibility | Key Modules |
| :--- | :--- | :--- |
| **`agent/`** | Multi-agent reasoning, smart funnel, screening & debates | [`smart_funnel.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/smart_funnel.py), [`multi_agent.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/multi_agent.py), [`dag_orchestrator.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/dag_orchestrator.py), [`personas.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/personas.py), [`tools.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/tools.py) |
| **`analysis/`** | Quantitative sector rotation, forensic accounting & DCF | [`sector_rotation.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/analysis/sector_rotation.py), [`forensic.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/analysis/forensic.py), [`dcf.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/analysis/dcf.py), [`fundamental.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/analysis/fundamental.py) |
| **`brokers/`** | Broker unified abstraction (data vs execution) | [`session.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/session.py), [`fyers.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/fyers.py) *(data)*, [`zerodha.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/zerodha.py) *(execution)*, [`angelone.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/angelone.py), [`groww.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/groww.py), [`upstox.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/upstox.py), [`mock.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/mock.py) |
| **`engine/`** | Backtesting, risk gate, execution, sizing & cache | [`backtest.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/backtest.py), [`position_sizer.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/position_sizer.py), [`risk_gate.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/risk_gate.py), [`analysis_cache.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/analysis_cache.py), [`paper.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/paper.py), [`trader.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/trader.py) |
| **`market/`** | Market feeds, options chain, quotes & sentiment | [`quotes.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/market/quotes.py), [`options.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/market/options.py), [`indices.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/market/indices.py), [`websocket.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/market/websocket.py), [`sentiment.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/market/sentiment.py) |
| **`web/`** | FastAPI sidecar API (port `8765`), OAuth & SSE | [`api.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/web/api.py), [`auth.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/web/auth.py), [`sse.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/web/sse.py), [`openclaw.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/web/openclaw.py), [`skills.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/web/skills.py) |
| **`app/`** | Interactive REPL, CLI commands & launcher | [`main.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/app/main.py), [`repl.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/app/repl.py), [`commands/`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/app/commands) |
| **`ui/`** | Rich terminal TUI & Textual widgets | [`app.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/ui/app.py), [`widgets/`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/ui/widgets) |
| **`config/`** | Credential management (keychain + .env) & paths | [`credentials.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/config/credentials.py), [`paths.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/config/paths.py) |
| **`tests/`** | Comprehensive unit & integration tests | [`conftest.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/tests/conftest.py), 90+ test suites (deterministic, synthetic data) |

---

## 2. Critical Safety & Trading Guardrails

1. **Default to Paper/Mock Mode**:
   - Automated scripts, CLI commands, and test suites must **always** operate in `PAPER` or `mock` mode unless explicitly configured otherwise.
   - `TRADING_MODE=PAPER` is the safety default in `.env`.
   - Never execute real broker order placement without explicit user intent and confirmation.
2. **Credential & Secret Protection**:
   - Never commit, log, or hardcode API keys, API secrets, access tokens, TOTP secrets, passwords, or `.env` files.
   - Use [`config.credentials`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/config/credentials.py) and OS keychain storage for sensitive tokens.
3. **SEBI IPv4 Network Binding**:
   - Indian broker APIs enforce registered static/whitelisted IPv4 addresses for order placement.
   - Keep the IPv4 `socket.getaddrinfo` override intact in [`app/main.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/app/main.py).
4. **Market Hours & IST Timings**:
   - Equity & F&O: 09:15 AM to 03:30 PM IST.
   - Commodity (MCX): Up to 11:30 PM / 11:55 PM IST.
   - Always handle market-closed edge cases gracefully when fetching live feeds.

---

## 3. Architecture & Design Patterns

### AI Multi-Agent & Smart Funnel Pipeline
1. **Stage 1 (Pure Quant Pre-Filter)**: 0-token deterministic screening on technicals, valuation, sector RRG momentum, and forensic accounting flags before any LLM is called.
2. **Stage 2 (Macro & Sector Context)**: India VIX, NIFTY 50 breadth, FII/DII institutional flows, and Sector RRG rotation matrix.
3. **Stage 3 (Adversarial Multi-Agent Debate)**: Bull vs Bear analysts + 6 Persona Analysts (`buffett`, `jhunjhunwala`, `lynch`, `soros`, `munger`, `forensic`) + Facilitator + Fund Manager verdict synthesis.
4. **Dual-LLM Routing**:
   - Fast extraction layer (`AI_FAST_PROVIDER` e.g. Gemini Flash / Groq) for high-speed parallel extraction.
   - Deep reasoning layer (`AI_DEEP_PROVIDER` e.g. NVIDIA NIM / Claude / OpenAI / DeepSeek R1) for synthesis & risk gating.

### Quantitative & Risk Models
- **Relative Rotation Graphs (RRG)**: JdK RS-Ratio (trend) and RS-Momentum (velocity) classifying sectors into `LEADING`, `WEAKENING`, `LAGGING`, `IMPROVING`.
- **Forensic Accounting**: Beneish M-Score ($>-1.78$ flag), Altman Z''-Score ($>2.60$ SAFE), Piotroski 9-point F-Score, promoter share pledging ($>10\%$/$>20\%$), and accruals quality.
- **Position Sizing**: Volatility risk-parity ($1.5 \times \text{ATR}$ risk budget), Half-Kelly growth sizing, and standard F&O lot quantization.

### Broker Routing Pattern
- **Fyers**: Primary choice for market data & options chains (free API v3).
- **Zerodha / Angel One / Groww / Upstox / Dhan / Stoxkart**: Supported execution & account management.
- Always use the fallback chain (`brokers.session.get_broker()`) with graceful degradation to `yfinance` or mock providers if a live broker is disconnected.

---

## 4. Continuous Evolution & Lessons Learned

1. **Deterministic Test Isolation (No External HTTP in Tests)**:
   - All unit tests must be self-contained and run in $<1$s without making live HTTP requests to Screener.in, Yahoo Finance, or broker APIs.
   - Pass explicit synthetic data dictionaries (`data={...}`) or monkeypatch indices/quotes to guarantee deterministic outcomes.
2. **Windows Process & Concurrency Management**:
   - On Windows environments, run full pytest suites with `.venv\Scripts\pytest.exe -n 4` to prevent OS thread/worker pool exhaustion.
3. **Persistent SQLite Caching**:
   - Persist computed metrics in `analysis_cache` (15m for RRG/macro, 24h for fundamental forensics) to prevent duplicate compute and eliminate redundant API calls.
4. **Git Commits & Push ("Always Ask First")**:
   - **ALWAYS** request explicit user confirmation before executing any `git commit` or `git push` to GitHub.
   - Follow Conventional Commits format (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `perf:`).
   - **Do NOT** add `Co-Authored-By: Claude` or any AI attribution headers in commit messages.

---

## 5. Environment & Common Commands

### Running Tests
```powershell
# Run the complete fast test suite (skips network/slow tests automatically)
.venv\Scripts\pytest.exe -n 4

# Run a specific test suite with verbose output
.venv\Scripts\pytest.exe tests/test_smart_funnel.py -v

# Run with single process (debug mode)
.venv\Scripts\pytest.exe tests/test_schemas.py -n 0 -s
```

### Running the Application
```powershell
# Launch interactive terminal CLI (no broker / demo mode)
.venv\Scripts\python.exe -m app.main --no-broker

# Launch Textual TUI
.venv\Scripts\python.exe -m app.main --tui

# Start FastAPI Sidecar Web Server on port 8765
.venv\Scripts\python.exe -m uvicorn web.api:app --host 127.0.0.1 --port 8765 --reload
```

---

## 6. On-Demand Skills

Specialized step-by-step runbooks are available under `.agents/skills/`:
- **`backtesting`** (`.agents/skills/backtesting/SKILL.md`): Vectorized & regime-based strategy backtesting workflows.
- **`broker-management`** (`.agents/skills/broker-management/SKILL.md`): Adding/debugging broker authentications and OAuth callbacks.
- **`multi-agent-system`** (`.agents/skills/multi-agent-system/SKILL.md`): Agent personas, Smart Funnel, tool definitions, and LLM routing.
- **`quantitative-analysis`** (`.agents/skills/quantitative-analysis/SKILL.md`): Relative Rotation Graphs (RRG), Forensic accounting audits, and Volatility risk-parity position sizing.
- **`fastapi-sidecar`** (`.agents/skills/fastapi-sidecar/SKILL.md`): FastAPI endpoints, SSE streaming, and frontend bridges.
