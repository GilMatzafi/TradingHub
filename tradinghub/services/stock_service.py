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

class RateLimitError(Exception):
    """Custom exception for rate limiting errors"""
    pass

class StockService:
    """Service for handling stock data operations"""
    
    def __init__(self, config: Config = None):
        self.hammer_detector = HammerPattern()
        self._last_request_time = 0
        self.config = config or Config()
        self._min_request_interval = self.config.MIN_REQUEST_INTERVAL
        self._cache = {}  # Simple in-memory cache
        self._cache_ttl = self.config.CACHE_TTL  # Cache TTL in seconds
        self._request_count = 0
        self._last_reset_time = time.time()
    
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
    
    def reset_rate_limiting(self):
        """Reset rate limiting counters - useful for troubleshooting"""
        self._request_count = 0
        self._last_reset_time = time.time()
        self._last_request_time = 0
        logger.info("Rate limiting counters reset")
    
    def get_rate_limit_status(self):
        """Get current rate limiting status for debugging"""
        current_time = time.time()
        time_since_last_request = current_time - self._last_request_time
        time_since_reset = current_time - self._last_reset_time
        
        return {
            'request_count': self._request_count,
            'time_since_last_request': time_since_last_request,
            'time_since_reset': time_since_reset,
            'cache_size': len(self._cache)
        }
    
    def _rate_limit(self):
        """Implement rate limiting to avoid hitting Yahoo Finance API limits"""
        current_time = time.time()
        
        # Reset request count every hour
        if current_time - self._last_reset_time > 3600:
            self._request_count = 0
            self._last_reset_time = current_time
        
        # More aggressive rate limiting for intraday data
        if self._request_count > 100:  # Limit to 100 requests per hour
            wait_time = 60  # Wait 1 minute
            logger.warning(f"Rate limit exceeded. Waiting {wait_time} seconds...")
            time.sleep(wait_time)
            self._request_count = 0
            self._last_reset_time = current_time
        
        time_since_last_request = current_time - self._last_request_time
        
        # Increase minimum interval for intraday data
        min_interval = 2.0 if self._request_count > 50 else self._min_request_interval
        
        if time_since_last_request < min_interval:
            sleep_time = min_interval - time_since_last_request
            logger.info(f"Rate limiting: waiting {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        
        self._last_request_time = time.time()
        self._request_count += 1
    
    def _download_with_retry(self, symbol: str, start_date: str, end_date: str, interval: str) -> pd.DataFrame:
        """
        Download stock data with retry logic for rate limiting
        
        Args:
            symbol: Stock symbol
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            interval: Data interval
            
        Returns:
            DataFrame with stock data
        """
        last_exception = None
        
        for attempt in range(self.config.MAX_RETRY_ATTEMPTS):
            try:
                logger.info(f"Attempt {attempt + 1}/{self.config.MAX_RETRY_ATTEMPTS} to download {symbol} data")
                self._rate_limit()
                
                stock = yf.Ticker(symbol)
                logger.info(f"Downloading {symbol} data from {start_date} to {end_date} with interval {interval}")
                
                df = stock.history(
                    start=start_date,
                    end=end_date,
                    interval=interval
                )
                
                logger.info(f"Downloaded {len(df)} rows of data for {symbol}")
                
                # Check if we got rate limited
                if df.empty:
                    if interval in ['1m', '2m', '5m', '15m', '30m']:
                        logger.warning(f"Empty data for intraday interval {interval} - possible rate limiting")
                        raise RateLimitError("Rate limited by Yahoo Finance API")
                    else:
                        logger.warning(f"Empty data for {symbol} - symbol may not exist or no data available")
                
                return df
                
            except Exception as e:
                last_exception = e
                error_msg = str(e).lower()
                logger.error(f"Error downloading {symbol} data (attempt {attempt + 1}): {e}")
                
                # Check if this is a retryable error
                is_retryable = False
                if any(keyword in error_msg for keyword in ['rate limit', 'too many requests', '429']):
                    logger.error(f"Rate limit detected for {symbol}")
                    raise RateLimitError(f"Rate limited by Yahoo Finance API: {e}")
                elif any(keyword in error_msg for keyword in ['timeout', 'connection', 'network']):
                    is_retryable = True
                    logger.info(f"Network error for {symbol} - will retry")
                
                # If not the last attempt and error is retryable, wait and retry
                if attempt < self.config.MAX_RETRY_ATTEMPTS - 1 and is_retryable:
                    wait_time = min(self.config.RETRY_WAIT_MAX, 
                                  self.config.RETRY_WAIT_MIN * (2 ** attempt))
                    logger.info(f"Waiting {wait_time} seconds before retry...")
                    time.sleep(wait_time)
                    continue
                else:
                    logger.error(f"All retry attempts failed for {symbol}")
                    break
        
        # If we get here, all retries failed
        raise last_exception

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
        Download stock data from Yahoo Finance with rate limiting
        
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
            df = self._download_with_retry(
                symbol,
                start_date.strftime('%Y-%m-%d'),
                end_date.strftime('%Y-%m-%d'),
                interval
            )
            self._set_cached_data(cache_key, df)
            return df
        except RateLimitError as e:
            # Re-raise with a more user-friendly message
            raise RateLimitError("Too Many Requests. Rate limited. Try after a while.")
        except Exception as e:
            # Re-raise other exceptions
            raise e 