import os

class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-for-tradinghub'
    DEBUG = False
    TESTING = False
    
    # Default timezone for the application
    DEFAULT_TIMEZONE = 'Asia/Jerusalem'
    
    # Default stock data parameters
    DEFAULT_SYMBOL = 'AAPL'
    DEFAULT_DAYS = 50
    DEFAULT_INTERVAL = '5m'
    
    # Default strategy parameters
    DEFAULT_BODY_SIZE_RATIO = 0.3
    DEFAULT_LOWER_SHADOW_RATIO = 2.0
    DEFAULT_UPPER_SHADOW_RATIO = 0.1
    DEFAULT_MA_PERIOD = 5
    DEFAULT_REQUIRE_GREEN = True
    
    # Cache configuration
    CACHE_TTL = int(os.environ.get('CACHE_TTL', 300))  # cache TTL in seconds (5 minutes)


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True


class ProductionConfig(Config):
    """Production configuration"""
    # In production, use a secure secret key
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Disable debug mode in production
    DEBUG = False 