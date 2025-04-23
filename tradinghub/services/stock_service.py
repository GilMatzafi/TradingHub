import yfinance as yf
import pandas as pd
from typing import Dict, Any
from tradinghub.patterns.hammer_pattern import HammerPattern
from tradinghub.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.models.dto.analysis_results import PatternResult, AnalysisResult
from tradinghub.utils.time_utils import convert_to_israel_time

class StockService:
    """Service for handling stock data operations"""
    
    def __init__(self):
        self.hammer_detector = HammerPattern()
    
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
        
        stock = yf.Ticker(symbol)
        df = stock.history(
            start=start_date.strftime('%Y-%m-%d'),
            end=end_date.strftime('%Y-%m-%d'),
            interval=interval
        )
        return df 