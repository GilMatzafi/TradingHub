import pytz
from flask import current_app

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