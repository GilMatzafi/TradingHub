import pytz

def convert_to_israel_time(date):
    """
    Convert a datetime from US Eastern Time to Israel Time
    
    Args:
        date (datetime): Date to convert
        
    Returns:
        datetime: Date in Israel timezone
    """
    # Use default timezones (don't rely on Flask config to avoid context issues)
    et_tz = pytz.timezone('US/Eastern')
    israel_tz = pytz.timezone('Asia/Jerusalem')
    
    # Handle different date types
    if hasattr(date, 'to_pydatetime'):
        # Pandas Timestamp
        date = date.to_pydatetime()
    elif isinstance(date, (int, float)):
        # Unix timestamp
        import datetime
        date = datetime.datetime.fromtimestamp(date)
    
    # If the date is naive (no timezone), assume it's in ET
    if date.tzinfo is None:
        date = et_tz.localize(date)
    
    # Convert to Israel time
    israel_time = date.astimezone(israel_tz)
    return israel_time 

def normalize_datetime_to_israel_naive(date):
    """
    Convert a datetime-like object to Israel timezone and return tz-naive datetime.
    Safe across pandas.Timestamp and Python datetime, handling DST ambiguities.
    """
    israel_tz = pytz.timezone('Asia/Jerusalem')
    et_tz = pytz.timezone('US/Eastern')
    import datetime
    # Pandas Timestamp
    if hasattr(date, 'to_pydatetime'):
        date = date.to_pydatetime()
    # Unix timestamp
    if isinstance(date, (int, float)):
        date = datetime.datetime.fromtimestamp(date)
    # Localize if naive (assume ET as data source)
    if isinstance(date, datetime.datetime) and date.tzinfo is None:
        try:
            date = et_tz.localize(date)
        except Exception:
            # Fallback: treat as Israel tz directly
            date = israel_tz.localize(date)
    try:
        return date.astimezone(israel_tz).replace(tzinfo=None)
    except Exception:
        return date.replace(tzinfo=None)

def normalize_series_to_israel_naive(series_or_index):
    """
    Normalize a pandas Series or DatetimeIndex to Israel timezone and strip tz.
    Handles tz-naive and tz-aware inputs, DST ambiguous/nonexistent times.
    """
    try:
        import pandas as pd
    except Exception:
        return series_or_index
    israel_tz = 'Asia/Jerusalem'
    s = series_or_index
    # Convert to pandas datetime if it's a Series
    if isinstance(s, pd.Series):
        s = pd.to_datetime(s, errors='coerce')
        try:
            if s.dt.tz is not None:
                s = s.dt.tz_convert(israel_tz).dt.tz_localize(None)
            else:
                s = s.dt.tz_localize(israel_tz, ambiguous='infer', nonexistent='shift_forward').dt.tz_localize(None)
        except Exception:
            s = s.dt.tz_localize(None)
        return s
    # DatetimeIndex
    if isinstance(s, pd.DatetimeIndex):
        try:
            if s.tz is not None:
                return s.tz_convert(israel_tz).tz_localize(None)
            else:
                return s.tz_localize(israel_tz, ambiguous='infer', nonexistent='shift_forward').tz_localize(None)
        except Exception:
            return s.tz_localize(None)
    return s