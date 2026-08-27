# AGENTS.md — india-trade-cli Agent Guidelines

> Operational handbook and architectural guidelines for AI agents working in the `india-trade-cli` codebase.

---

## 1. Project Context & High-Level Architecture

`india-trade-cli` is an institutional-grade, AI-powered multi-agent algorithmic trading, analysis, and backtesting platform for Indian financial markets (**NSE, BSE, NFO, MCX**).

### Component Map

| Directory | Responsibility | Key Modules |
| :--- | :--- | :--- |
| **`agent/`** | Multi-agent reasoning, smart funnel, screening & debates | [`smart_funnel.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/smart_funnel.py), [`multi_agent.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/multi_agent.py), [`dag_orchestrator.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/dag_orchestrator.py), [`personas.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/personas.py), [`tools.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/tools.py) |
| **`brokers/`** | Broker unified abstraction (data vs execution) | [`session.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/session.py), [`fyers.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/fyers.py) *(data)*, [`zerodha.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/zerodha.py) *(execution)*, [`angelone.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/angelone.py), [`groww.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/groww.py), [`upstox.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/upstox.py), [`mock.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/brokers/mock.py) |
| **`engine/`** | Backtesting, risk gate, execution & paper trading | [`backtest.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/backtest.py), [`backtest_vectorized.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/backtest_vectorized.py), [`risk_gate.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/risk_gate.py), [`paper.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/paper.py), [`trader.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/trader.py), [`strategy_library.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/engine/strategy_library.py) |
| **`market/`** | Market feeds, options chain, quotes & sentiment | [`quotes.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/market/quotes.py), [`options.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/market/options.py), [`nse_scraper.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/market/nse_scraper.py), [`websocket.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/market/websocket.py), [`sentiment.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/market/sentiment.py) |
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
1. **Stage 1 (Pure Quant Pre-Filter)**: 0-token deterministic screening on technicals/valuation before any LLM is called.
2. **Stage 2 (Macro Context)**: India VIX, NIFTY 50 breadth, FII/DII institutional flows, sector rotation.
3. **Stage 3 (Adversarial Multi-Agent Debate)**: Bull vs Bear analysts + Facilitator + Fund Manager verdict synthesis.
4. **Dual-LLM Routing**:
   - Fast extraction layer (`AI_FAST_PROVIDER` e.g. Gemini Flash / Groq) for high-speed parallel extraction.
   - Deep reasoning layer (`AI_DEEP_PROVIDER` e.g. NVIDIA NIM / Claude / OpenAI / DeepSeek R1) for synthesis & risk gating.

### Broker Routing Pattern
- **Fyers**: Primary choice for market data & options chains (free API v3).
- **Zerodha / Angel One / Groww / Upstox / Dhan**: Supported execution & account management.
- Always use the fallback chain (`brokers.session.get_broker()`) with graceful degradation to `yfinance` or mock providers if a live broker is disconnected.

---

## 4. Development Workflow & Coding Standards

### Workflow: Spec -> Tests -> Code
- Follow Test-Driven Development (TDD) for all financial calculations, risk checks, and data parsers.
- All test fixtures in [`tests/conftest.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/tests/conftest.py) produce deterministic synthetic data without making external network calls.

### Code Style & Standards
- **Python**: Target Python 3.11+. Use modern type annotations (`dict[str, Any]`, `list[str]`, `X | None`).
- **Formatting/Linting**: Configured via Ruff (`line-length = 100`, `target-version = "py311"`).
- **Async/Await**: Non-blocking I/O with `asyncio`, `httpx`, and FastAPI for sidecar and WebSocket streams.
- **Git Commits**:
  - Follow Conventional Commits format (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `perf:`).
  - Keep messages concise and informative.
  - **Do NOT** add `Co-Authored-By: Claude` or any AI attribution headers in commit messages.

---

## 5. Environment & Common Commands

### Python Environment (Windows PowerShell)
- Virtualenv Python: `.venv\Scripts\python.exe`
- Virtualenv Pytest: `.venv\Scripts\pytest.exe`

### Running Tests
```powershell
# Run the complete fast test suite (skips network/slow tests automatically)
.venv\Scripts\pytest.exe

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
- **`fastapi-sidecar`** (`.agents/skills/fastapi-sidecar/SKILL.md`): FastAPI endpoints, SSE streaming, and frontend bridges.
