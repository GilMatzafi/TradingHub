import yfinance as yf
import pandas as pd
from typing import Dict, Any
import time
import logging
from tradinghub.patterns.hammer_pattern import HammerPattern
from tradinghub.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.models.dto.analysis_results import PatternResult, AnalysisResult
from tradinghub.utils.time_utils import convert_to_israel_time
from tradinghub.config.config import Config

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class StockService:
    """Service for handling stock data operations"""
    
    def __init__(self, config: Config = None):
        self.hammer_detector = HammerPattern()
        self.config = config or Config()
        self._cache = {}  # Simple in-memory cache
        self._cache_ttl = self.config.CACHE_TTL  # Cache TTL in seconds
    
    def _get_cache_key(self, symbol: str, start_date: str, end_date: str, interval: str) -> str:
        """Generate a cache key for the request"""
        return f"{symbol}_{start_date}_{end_date}_{interval}"
    
    def _get_cached_data(self, cache_key: str) -> pd.DataFrame:
        """Get data from cache if it exists and is not expired"""
        if cache_key in self._cache:
            cached_data, timestamp = self._cache[cache_key]
            if time.time() - timestamp < self._cache_ttl:
                logger.info(f"Using cached data for {cache_key}")
                return cached_data.copy()  # Return a copy to avoid modifying cached data
        return None
    
    def _set_cached_data(self, cache_key: str, data: pd.DataFrame):
        """Store data in cache with timestamp"""
        self._cache[cache_key] = (data.copy(), time.time())
        logger.info(f"Cached data for {cache_key}")
        
        # Clean up old cache entries (keep only last 50 entries)
        if len(self._cache) > 50:
            oldest_key = min(self._cache.keys(), key=lambda k: self._cache[k][1])
            del self._cache[oldest_key]
    
    def clear_cache(self):
        """Clear the cache - useful for troubleshooting"""
        self._cache.clear()
        logger.info("Cache cleared")
    
    
    def _download_stock_data(self, symbol: str, start_date: str, end_date: str, interval: str) -> pd.DataFrame:
        """
        Download stock data from Yahoo Finance
        
        Args:
            symbol: Stock symbol
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            interval: Data interval
            
        Returns:
            DataFrame with stock data
        """
        try:
            stock = yf.Ticker(symbol)
            logger.info(f"Downloading {symbol} data from {start_date} to {end_date} with interval {interval}")
            
            df = stock.history(
                start=start_date,
                end=end_date,
                interval=interval
            )
            
            logger.info(f"Downloaded {len(df)} rows of data for {symbol}")
            
            if df.empty:
                logger.warning(f"Empty data for {symbol} - symbol may not exist or no data available")
            
            return df
            
        except Exception as e:
            logger.error(f"Error downloading {symbol} data: {e}")
            raise e

    def analyze_stock(self, request: AnalysisRequest) -> AnalysisResult:
        """
        Analyze stock data for patterns
        
        Args:
            request (AnalysisRequest): Analysis request parameters
            
        Returns:
            AnalysisResult: Analysis results
        """
        # Download data
        df = self.download_stock_data(
            request.symbol,
            request.days,
            request.interval
        )
        
        if df.empty:
            return AnalysisResult(count=0, patterns=[])
        
        # Detect patterns
        df = self.hammer_detector.detect(df, request.pattern_params.__dict__)
        
        # Find patterns
        hammers = df[df['is_hammer']]
        
        # Convert to result objects
        patterns = []
        for date, row in hammers.iterrows():
            israel_time = convert_to_israel_time(date)
            pattern = PatternResult(
                date=israel_time,
                trend=row['trend'],
                open_price=float(row['Open']),
                high_price=float(row['High']),
                low_price=float(row['Low']),
                close_price=float(row['Close'])
            )
            patterns.append(pattern)
        
        return AnalysisResult(count=len(patterns), patterns=patterns)
    
    def download_stock_data(self, symbol: str, days: int, interval: str) -> pd.DataFrame:
        """
        Download stock data from Yahoo Finance
        
        Args:
            symbol (str): Stock symbol
            days (int): Number of days to analyze
            interval (str): Data interval (1m, 5m, 15m, 30m, 1h, 1d)
            
        Returns:
            pd.DataFrame: Stock data
        """
        from datetime import datetime, timedelta
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        cache_key = self._get_cache_key(symbol, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'), interval)
        cached_data = self._get_cached_data(cache_key)
        
        if cached_data is not None:
            return cached_data
        
        try:
            df = self._download_stock_data(
                symbol,
                start_date.strftime('%Y-%m-%d'),
                end_date.strftime('%Y-%m-%d'),
                interval
            )
            self._set_cached_data(cache_key, df)
            return df
        except Exception as e:
            # Re-raise exceptions
            raise e 