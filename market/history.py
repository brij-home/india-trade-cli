"""
market/history.py
─────────────────
Historical OHLCV data. Fetches via the active broker (Zerodha/Groww/Mock).
Returns pandas DataFrames for downstream analysis.

Intervals supported (Zerodha notation):
    "minute", "3minute", "5minute", "10minute", "15minute",
    "30minute", "60minute", "day"
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

import pandas as pd


# ── Interval aliases ─────────────────────────────────────────

INTERVAL_MAP = {
    "1m": "minute",
    "3m": "3minute",
    "5m": "5minute",
    "10m": "10minute",
    "15m": "15minute",
    "30m": "30minute",
    "1h": "60minute",
    "1d": "day",
    "day": "day",
}


def get_ohlcv(
    symbol: str,
    exchange: str = "NSE",
    interval: str = "day",
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    days: int = 365,
) -> pd.DataFrame:
    """
    Fetch historical OHLCV data as a DataFrame.

    Args:
        symbol:    Trading symbol e.g. "RELIANCE", "NIFTY 50"
        exchange:  "NSE" | "BSE" | "NFO" | "MCX"
        interval:  Candle size — "day", "1h", "15m", "5m", "1m" etc.
        from_date: Start date (default: today - days)
        to_date:   End date (default: today)
        days:      Lookback in days if from_date not given (max 2000 for day)

    Returns:
        DataFrame with columns: date, open, high, low, close, volume
        Index: date (datetime)
    """
    to_date = to_date or datetime.now()
    from_date = from_date or (to_date - timedelta(days=days))

    # Normalize interval alias
    kite_interval = INTERVAL_MAP.get(interval, interval)

    # Data cascade: broker API → yfinance → disk cache. No mock/synthetic data.
    raw = None
    try:
        from brokers.session import get_broker

        broker = get_broker()
        # Only use broker for real data — skip if it's the mock broker
        if not getattr(broker, "_is_mock", False):
            raw = broker.get_historical_data(
                symbol=symbol,
                exchange=exchange,
                interval=kite_interval,
                from_date=from_date,
                to_date=to_date,
            )
        else:
            # Mock broker: still use yfinance for real market data
            raw = _yfinance_fallback(symbol, exchange, kite_interval, from_date, to_date)
    except Exception:
        pass

    if not raw:
        raw = _yfinance_fallback(symbol, exchange, kite_interval, from_date, to_date)
        # Cache successful daily fetches to disk for offline fallback
        if raw and kite_interval == "day":
            save_ohlcv_cache(f"ohlcv_{symbol}", raw)

    if not raw:
        # Tier 3: disk cache — last-resort when both broker and yfinance fail
        raw, _ = load_ohlcv_cache(f"ohlcv_{symbol}")

    if not raw:
        return pd.DataFrame(columns=["date", "open", "high", "low", "close", "volume"])

    df = pd.DataFrame(raw)
    df.rename(columns={"date": "date"}, inplace=True)
    df["date"] = pd.to_datetime(df["date"])
    df.set_index("date", inplace=True)
    df = df[["open", "high", "low", "close", "volume"]].astype(float)
    df.sort_index(inplace=True)

    # Overlay latest live real-time tick to guarantee decision-making on fresh data
    if kite_interval == "day" and not df.empty:
        df = inject_live_tick(df, symbol=symbol, exchange=exchange)

    return df


def inject_live_tick(
    df: pd.DataFrame,
    symbol: str,
    exchange: str = "NSE",
) -> pd.DataFrame:
    """
    Overlays the current second's live tick (LTP, Day High/Low, Volume) onto the OHLCV DataFrame.
    Ensures all quantitative models evaluate the latest real-time market state.
    """
    try:
        from market.quotes import get_quote

        inst = f"{exchange}:{symbol}"
        quotes = get_quote([inst])
        q = quotes.get(inst)
        if not q or q.last_price <= 0:
            return df

        now = datetime.now()
        today_date = pd.Timestamp(now.date())

        if df.empty:
            new_row = pd.DataFrame(
                [{
                    "open": q.open or q.last_price,
                    "high": q.high or q.last_price,
                    "low": q.low or q.last_price,
                    "close": q.last_price,
                    "volume": q.volume or 0.0,
                }],
                index=[today_date],
            )
            return new_row

        last_idx = df.index[-1]
        last_date = pd.Timestamp(last_idx).date() if hasattr(last_idx, "date") else None

        if last_date == now.date():
            # Update today's existing candle with live tick
            df.loc[last_idx, "close"] = float(q.last_price)
            if q.high and q.high > 0:
                df.loc[last_idx, "high"] = max(float(df.loc[last_idx, "high"]), float(q.high))
            else:
                df.loc[last_idx, "high"] = max(float(df.loc[last_idx, "high"]), float(q.last_price))
            if q.low and q.low > 0:
                df.loc[last_idx, "low"] = min(float(df.loc[last_idx, "low"]), float(q.low))
            else:
                df.loc[last_idx, "low"] = min(float(df.loc[last_idx, "low"]), float(q.last_price))
            if q.volume and q.volume > 0:
                df.loc[last_idx, "volume"] = float(q.volume)
        else:
            # Append today's active bar
            new_row = pd.DataFrame(
                [{
                    "open": float(q.open or q.last_price),
                    "high": float(q.high or q.last_price),
                    "low": float(q.low or q.last_price),
                    "close": float(q.last_price),
                    "volume": float(q.volume or 0.0),
                }],
                index=[today_date],
            )
            df = pd.concat([df, new_row])

        return df
    except Exception:
        return df


def save_ohlcv_cache(key: str, data: list) -> None:
    """Save OHLCV rows to disk cache (daily interval only)."""
    from market.disk_cache import save_cache

    save_cache(key, data)



def load_ohlcv_cache(key: str) -> tuple[list, None]:
    """Load OHLCV rows from disk cache."""
    from market.disk_cache import load_cache

    return load_cache(key)


def _yfinance_fallback(
    symbol: str,
    exchange: str,
    interval: str,
    from_date: datetime,
    to_date: datetime,
) -> list[dict]:
    """Try yfinance for real market data when broker API is unavailable."""
    try:
        from market.yfinance_provider import yf_get_ohlcv, yf_available

        if not yf_available():
            return []
        return yf_get_ohlcv(
            symbol=symbol,
            exchange=exchange,
            interval=interval,
            from_date=from_date,
            to_date=to_date,
        )
    except Exception:
        return []


def _get_instrument_token(symbol: str, exchange: str) -> int:
    """Look up instrument token from broker's instrument list."""
    from brokers.session import get_broker

    broker = get_broker()
    if not hasattr(broker, "kite"):
        return 0
    instruments = broker.kite.instruments(exchange)
    for inst in instruments:
        if inst["tradingsymbol"] == symbol:
            return inst["instrument_token"]
    raise ValueError(f"Instrument not found: {exchange}:{symbol}")


# NOTE: _mock_ohlcv and get_ohlcv_mock were removed.
# All market data now comes from real sources (broker API or yfinance).
# No synthetic/random data is ever served to users.
