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
    # Get timezone from config or use defaults
    et_tz = pytz.timezone('US/Eastern')
    israel_tz = pytz.timezone(current_app.config.get('DEFAULT_TIMEZONE', 'Asia/Jerusalem'))
    
    # If the date is naive (no timezone), assume it's in ET
    if date.tzinfo is None:
        date = et_tz.localize(date)
    
    # Convert to Israel time
    israel_time = date.astimezone(israel_tz)
    return israel_time 