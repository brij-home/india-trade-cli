---
name: fastapi-sidecar
description: >-
  Develop, test, and maintain the FastAPI sidecar server (port 8765), SSE
  streaming endpoints, OpenClaw skill manifests, OAuth callback handlers,
  and desktop/web UI integration in web/.
---

# FastAPI Sidecar & Web API Runbook

## Server Overview

The FastAPI sidecar (`web.api:app`) acts as the local backend service on port `8765`:
- **Local Browser OAuth**: Handles redirect authentication for Zerodha, Fyers, Upstox, and Groww without exposing credentials.
- **REST APIs**: Provides portfolio, order book, watchlist, quote, and market breadth endpoints for the Desktop (Electron/macOS) and Web UIs.
- **Server-Sent Events (SSE)** ([`web/sse.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/web/sse.py)): Streams live market ticks, agent debate turns, and trade notifications to frontends in real time.
- **OpenClaw Integration** ([`web/openclaw.py`](file:///c:/Users/brije/.gemini/antigravity/scratch/india-trade-cli/web/openclaw.py)): Exposes tool manifests and remote execution capabilities for external AI agents.

---

## Server Endpoints

| Path | Method | Purpose |
| :--- | :--- | :--- |
| `/` | `GET` | HTML broker login dashboard |
| `/<broker>/login` | `GET` | Initiates OAuth flow for specified broker |
| `/<broker>/callback`| `GET` | Receives auth code / token from broker redirect |
| `/api/status` | `GET` | JSON status of active broker sessions |
| `/api/portfolio` | `GET` | Combined portfolio positions and holdings |
| `/api/stream/events` | `GET` | SSE stream for real-time market updates & agent output |
| `/api/skills` | `GET/POST`| Dynamic execution of registered platform skills |

---

## Running and Testing the Sidecar

```powershell
# Start FastAPI sidecar with auto-reload
.venv\Scripts\python.exe -m uvicorn web.api:app --host 127.0.0.1 --port 8765 --reload

# Test sidecar authentication and endpoints
.venv\Scripts\pytest.exe tests/test_api_broker.py -v

# Test SSE streaming functionality
.venv\Scripts\pytest.exe tests/test_sse_streaming.py -v
```
