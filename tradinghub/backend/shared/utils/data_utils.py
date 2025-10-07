from typing import Any, Dict, List, Tuple
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams
from tradinghub.backend.shared.models.dto.backtest_params import BacktestParams


def format_stock_data(df) -> List[Dict[str, Any]]:
    """Format OHLCV dataframe for frontend consumption."""
    stock_data: List[Dict[str, Any]] = []
    for idx, row in df.iterrows():
        stock_data.append({
            'date': idx.strftime('%Y-%m-%d %H:%M:%S') if hasattr(idx, 'strftime') else str(idx),
            'open': float(row['Open']),
            'high': float(row['High']),
            'low': float(row['Low']),
            'close': float(row['Close']),
            'volume': float(row.get('Volume', 0))
        })
    return stock_data


def serialize_datetime_fields(obj: Any) -> Any:
    """Recursively convert datetime-like objects in dict/list to ISO strings."""
    try:
        import datetime as _dt
    except Exception:
        _dt = None

    # pandas Timestamp and DatetimeIndex elements
    if 'pandas' in str(type(obj)) or (hasattr(obj, 'isoformat') and str(type(obj)).endswith("Timestamp'>")):
        try:
            return obj.isoformat() if hasattr(obj, 'isoformat') else str(obj)
        except Exception:
            return str(obj)

    if isinstance(obj, list):
        return [serialize_datetime_fields(x) for x in obj]
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            out[k] = serialize_datetime_fields(v)
        return out
    if _dt and isinstance(obj, _dt.datetime):
        try:
            return obj.isoformat()
        except Exception:
            return str(obj)
    return obj


def parse_pattern_params(data: Dict[str, Any]) -> PatternParams:
    """Parse pattern parameters from request data with fallback defaults."""
    def safe_bool(value, default: bool) -> bool:
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() == 'true'
        return default

    return PatternParams(
        body_size_ratio=float(data.get('body_size_ratio', PatternParams.body_size_ratio)),
        lower_shadow_ratio=float(data.get('lower_shadow_ratio', PatternParams.lower_shadow_ratio)),
        upper_shadow_ratio=float(data.get('upper_shadow_ratio', PatternParams.upper_shadow_ratio)),
        ma_period=int(data.get('ma_period', PatternParams.ma_period)),
        require_green=safe_bool(data.get('require_green', PatternParams.require_green), PatternParams.require_green),
        min_relative_volume=float(data.get('min_relative_volume', PatternParams.min_relative_volume)),
        volume_lookback=int(data.get('volume_lookback', PatternParams.volume_lookback)),
        shadow_balance_ratio=float(data.get('shadow_balance_ratio', PatternParams.shadow_balance_ratio)),
        require_high_volume=safe_bool(data.get('require_high_volume', PatternParams.require_high_volume), PatternParams.require_high_volume)
    )


def parse_backtest_params(data: Dict[str, Any]) -> BacktestParams:
    """Parse backtest parameters from request data with sane defaults."""
    return BacktestParams(
        stop_loss_pct=float(data.get('stop_loss_pct', 0.02)),
        take_profit_pct=float(data.get('take_profit_pct', 0.04)),
        entry_delay=int(data.get('entry_delay', 1)),
        max_holding_periods=int(data.get('max_holding_periods', 20)),
        initial_portfolio_size=float(data.get('initial_portfolio_size', 10000)),
        commission=float(data.get('commission', 0.65)),
        slippage=float(data.get('slippage', 0.1))
    )


def normalize_patterns_payload(incoming_patterns: List[Any]) -> List[Dict[str, Any]]:
    """Ensure each pattern dict has 'date' and keep fields intact; ignore invalid items."""
    patterns: List[Dict[str, Any]] = []
    for p in incoming_patterns or []:
        if not isinstance(p, dict):
            continue
        normalized = dict(p)
        if 'date' not in normalized:
            if 'datetime' in normalized:
                normalized['date'] = normalized.get('datetime')
            elif 'time' in normalized:
                normalized['date'] = normalized.get('time')
        patterns.append(normalized)
    return patterns


def normalize_request_params(data: Dict[str, Any]) -> Tuple[str, int, str]:
    """Coerce symbol upper, clamp days, validate interval to known set."""
    symbol = str(data.get('symbol', 'AAPL')).upper()
    # Clamp days between 1 and 3650 (10 years) to avoid abuse
    try:
        days = int(data.get('days', 50))
    except Exception:
        days = 50
    days = max(1, min(days, 3650))

    valid_intervals = {'1m','2m','5m','15m','30m','60m','90m','1h','1d','5d','1wk','1mo','3mo'}
    interval = str(data.get('interval', '5m'))
    if interval not in valid_intervals:
        interval = '5m'
    return symbol, days, interval

