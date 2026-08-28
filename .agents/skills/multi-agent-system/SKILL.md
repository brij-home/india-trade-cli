---
name: multi-agent-system
description: >-
  Orchestrate, tune, and extend the multi-agent AI pipeline in india-trade-cli,
  including Smart Funnel (Stage 1-4), Bull vs Bear debates, persona agents,
  DAG orchestrator, tool definitions, and Dual-LLM routing.
---

# Multi-Agent System & Smart Funnel Runbook

## Core Architecture

The AI layer in `india-trade-cli` uses a multi-tier pipeline designed to maximize accuracy and minimize token consumption:

1. **Stage 1 — 0-Token Quant Pre-Filter** ([`agent/smart_funnel.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/smart_funnel.py)):
   - Runs deterministic, pure-Python checks on technical indicators (RSI, EMAs, Supertrend, 200-DMA), valuation (PE/PB, ROE, D/E), Sector RRG momentum tailwinds, and Forensic accounting/governance red flags.
   - Discards unqualified stocks with explicit rejection reasons before invoking any LLMs.
2. **Stage 2 — Shared Macro Context**:
   - Injects India VIX, NIFTY 50 breadth, FII/DII institutional flows, USD/INR, Crude oil, Gold, and Sector RRG rotation matrix into a shared context object.
3. **Stage 3 — Adversarial Multi-Agent Debate & Persona Roster** ([`agent/multi_agent.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/multi_agent.py), [`agent/personas.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/personas.py)):
   - **Bull Analyst**: Argues long thesis, catalysts, and support levels.
   - **Bear Analyst**: Argues short/risk thesis, overhead resistance, and tail risks.
   - **6 Named Persona Analysts**:
     - `buffett` (Value, Moat, High ROE)
     - `jhunjhunwala` (Growth-Value, India Macro Mega-trends)
     - `lynch` (GARP, PEG Ratio, Margin Expansion)
     - `soros` (Global Macro, Reflexivity, Currency/Commodity)
     - `munger` (Quality, Inversion, Lollapalooza Risks)
     - `forensic` (Forensic Auditor: Beneish M-Score, Altman Z''-Score, Piotroski F-Score, Promoter Pledge)
   - **Debate Facilitator**: Mediates points of contention across rounds.
   - **Fund Manager / Risk Gate**: Synthesizes the final verdict (`BUY`, `STRONG_BUY`, `HOLD`, `SELL`, `STRONG_SELL`, `AVOID`), confidence score, entry, stop-loss, target, and volatility risk-parity position size.
4. **DAG Orchestration** ([`agent/dag_orchestrator.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/dag_orchestrator.py)):
   - Executes parallel analyst tasks with dependency graphs and structured outputs.

---

## Dual-LLM Routing

Configured in `.env` and loaded via [`agent/core.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/core.py):

- **Fast Extraction Layer** (`AI_FAST_PROVIDER`, `AI_FAST_MODEL`):
   - Used for quick data extraction, news sentiment parsing, and preliminary scanning.
   - Recommended: `gemini` (`gemini-2.0-flash`), `groq` (`llama-3.3-70b-versatile`).
- **Deep Reasoning Layer** (`AI_DEEP_PROVIDER`, `AI_DEEP_MODEL`):
   - Used for adversarial debates, complex synthesis, and risk gate decisions.
   - Recommended: `nvidia` (`meta/llama-3.3-70b-instruct`), `anthropic` (`claude-3-7-sonnet`), `openai` (`gpt-4o` / `o3-mini`).

---

## Registered Agent Tools

All tools exposed to LLM agents are defined in [`agent/tools.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/tools.py):
- `get_sector_rotation_matrix`: NSE sector RRG quadrants (Leading/Weakening/Lagging/Improving).
- `get_stock_sector_alignment`: Stock-to-sector tailwind scoring (0-100).
- `audit_forensics`: Beneish M-Score, Altman Z-Score, Piotroski F-Score, promoter pledging.
- `get_macro_snapshot` & `get_stock_macro_linkages`: Global macro metrics & sensitivities.
- `calculate_position_size`: Volatility risk-parity, Half-Kelly, and F&O lot sizing.
- `get_quote`, `get_options_chain`, `get_pcr`, `get_dcf_valuation`, `search_web`.

---

## Verification & Testing

```powershell
# Run all multi-agent & persona test suites
.venv\Scripts\pytest.exe tests/test_personas.py tests/test_persona_debate.py tests/test_smart_funnel.py -v

# Run complete test suite (Windows safe with 4 workers)
.venv\Scripts\pytest.exe -n 4
```
