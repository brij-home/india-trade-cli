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
   - Runs deterministic, pure-Python checks on technical indicators (RSI, EMAs, Supertrend), valuation (PE/PB), and fundamentals.
   - Discards unqualified stocks with explicit rejection reasons before invoking any LLMs.
2. **Stage 2 — Shared Macro Context**:
   - Injects India VIX, NIFTY 50 breadth, FII/DII institutional flows, and Sector Rotation into a shared context object.
3. **Stage 3 — Adversarial Multi-Agent Debate** ([`agent/multi_agent.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/multi_agent.py)):
   - **Bull Analyst**: Argues long thesis, catalysts, and support levels.
   - **Bear Analyst**: Argues short/risk thesis, overhead resistance, and tail risks.
   - **Debate Facilitator**: Mediates points of contention across rounds.
   - **Fund Manager / Risk Gate**: Synthesizes the final verdict (`BUY`, `STRONG_BUY`, `HOLD`, `SELL`, `STRONG_SELL`, `AVOID`), confidence score, entry, stop-loss, and target.
4. **DAG Orchestration** ([`agent/dag_orchestrator.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/dag_orchestrator.py)):
   - Executes parallel analyst tasks with dependency graphs and structured outputs.

---

## Dual-LLM Routing

Configured in `.env` and loaded via [`agent/core.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/core.py):

- **Fast Extraction Layer** (`AI_FAST_PROVIDER`, `AI_FAST_MODEL`):
  - Used for quick data extraction, news sentiment parsing, and preliminary scanning.
  - Recommended: `gemini` (`gemini-3.6-flash`), `groq` (`llama-3.3-70b-versatile`).
- **Deep Reasoning Layer** (`AI_DEEP_PROVIDER`, `AI_DEEP_MODEL`):
  - Used for adversarial debates, complex synthesis, and risk gate decisions.
  - Recommended: `nvidia` (`meta/llama-3.2-11b-vision-instruct` / `deepseek`), `anthropic` (`claude-3-7-sonnet`), `openai` (`gpt-4o` / `o3-mini`).

---

## Adding or Updating Agent Tools

All tools exposed to LLM agents are defined in [`agent/tools.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/agent/tools.py):
1. Create the Python function with explicit type hints and docstrings.
2. Register the tool schema in `TOOL_DEFINITIONS`.
3. Map the tool execution in `execute_tool(name, args)`.
4. Add deterministic unit tests in [`tests/test_agent_tools.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/tests/test_agent_tools.py).

---

## Verification & Testing

```powershell
# Test multi-agent schemas and parsers
.venv\Scripts\pytest.exe tests/test_schemas.py -v

# Test smart funnel screening logic
.venv\Scripts\pytest.exe tests/test_smart_funnel.py -v

# Test DAG orchestrator
.venv\Scripts\pytest.exe tests/test_dag_orchestrator.py -v
```
