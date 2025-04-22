import yfinance as yf
import pandas as pd
from typing import Dict, Any
from tradinghub.models.patterns.hammer_pattern import HammerPattern
from tradinghub.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.models.dto.analysis_results import PatternResult, AnalysisResult
from tradinghub.utils.time_utils import convert_to_israel_time
from tradinghub.models.dto.elephant_bar_params import ElephantBarParams, ElephantBarAnalysisRequest

class StockService:
    """Service for handling stock data operations"""
    
    def __init__(self):
        self.hammer_detector = HammerPattern()
    
    def analyze_stock(self, request: AnalysisRequest) -> Dict[str, Any]:
        """
        Analyze stock data for patterns
        
        Args:
            request (AnalysisRequest): Analysis request parameters
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        # Download data
        df = self.download_stock_data(
            request.symbol,
            request.days,
            request.interval
        )
        
        if df.empty:
            return {
                'chart_data': [],
                'patterns': []
            }
        
        # Calculate moving average
        df['MA'] = df['Close'].rolling(window=request.pattern_params.ma_period).mean()
        
        # Calculate candle properties
        df['Body_Size'] = abs(df['Close'] - df['Open'])
        df['Total_Size'] = df['High'] - df['Low']
        df['Body_Ratio'] = df['Body_Size'] / df['Total_Size']
        df['Upper_Shadow'] = df['High'] - df[['Open', 'Close']].max(axis=1)
        df['Lower_Shadow'] = df[['Open', 'Close']].min(axis=1) - df['Low']
        df['Upper_Shadow_Ratio'] = df['Upper_Shadow'] / df['Total_Size']
        df['Lower_Shadow_Ratio'] = df['Lower_Shadow'] / df['Total_Size']
        
        # Identify hammer patterns
        df['Is_Hammer'] = (
            (df['Body_Ratio'] <= request.pattern_params.body_size_ratio) &
            (df['Lower_Shadow_Ratio'] >= request.pattern_params.lower_shadow_ratio) &
            (df['Upper_Shadow_Ratio'] <= request.pattern_params.upper_shadow_ratio)
        )
        
        if request.pattern_params.require_green:
            df['Is_Hammer'] = df['Is_Hammer'] & (df['Close'] > df['Open'])
        
        # Check volume if required
        if request.pattern_params.min_relative_volume is not None:
            df['Avg_Volume'] = df['Volume'].rolling(window=request.pattern_params.volume_lookback).mean()
            df['Relative_Volume'] = df['Volume'] / df['Avg_Volume']
            df['Is_Hammer'] = df['Is_Hammer'] & (df['Relative_Volume'] >= request.pattern_params.min_relative_volume)
        
        # Get hammer patterns
        patterns = df[df['Is_Hammer']].copy()
        
        # Prepare chart data
        chart_data = [
            {
                'x': df.index,
                'y': df['Close'],
                'type': 'scatter',
                'name': 'Price'
            },
            {
                'x': df.index,
                'y': df['MA'],
                'type': 'scatter',
                'name': f'{request.pattern_params.ma_period} MA'
            },
            {
                'x': patterns.index,
                'y': patterns['Close'],
                'mode': 'markers',
                'marker': {
                    'color': 'red',
                    'size': 10
                },
                'name': 'Hammer Pattern'
            }
        ]
        
        return {
            'chart_data': chart_data,
            'patterns': patterns[['Open', 'High', 'Low', 'Close', 'Volume']].to_dict('records')
        }
    
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

    def analyze_elephant_bar(self, request: ElephantBarAnalysisRequest) -> Dict[str, Any]:
        """Analyze stock data for elephant bar patterns"""
        df = self.download_stock_data(request.symbol, request.days, request.interval)
        
        # Calculate moving average
        df['MA'] = df['Close'].rolling(window=request.pattern_params.ma_period).mean()
        
        # Calculate candle properties
        df['Body_Size'] = abs(df['Close'] - df['Open'])
        df['Total_Size'] = df['High'] - df['Low']
        df['Body_Ratio'] = df['Body_Size'] / df['Total_Size']
        df['Upper_Shadow'] = df['High'] - df[['Open', 'Close']].max(axis=1)
        df['Lower_Shadow'] = df[['Open', 'Close']].min(axis=1) - df['Low']
        df['Shadow_Ratio'] = (df['Upper_Shadow'] + df['Lower_Shadow']) / df['Total_Size']
        
        # Identify elephant bar patterns
        df['Is_Elephant_Bar'] = (
            (df['Body_Ratio'] >= request.pattern_params.body_size_ratio) &
            (df['Shadow_Ratio'] <= request.pattern_params.shadow_ratio)
        )
        
        if request.pattern_params.require_green:
            df['Is_Elephant_Bar'] = df['Is_Elephant_Bar'] & (df['Close'] > df['Open'])
        
        # Check volume if required
        if request.pattern_params.min_relative_volume is not None:
            df['Avg_Volume'] = df['Volume'].rolling(window=request.pattern_params.volume_lookback).mean()
            df['Relative_Volume'] = df['Volume'] / df['Avg_Volume']
            df['Is_Elephant_Bar'] = df['Is_Elephant_Bar'] & (df['Relative_Volume'] >= request.pattern_params.min_relative_volume)
        
        # Get elephant bar patterns
        patterns = df[df['Is_Elephant_Bar']].copy()
        
        # Prepare chart data
        chart_data = [
            {
                'x': df.index,
                'y': df['Close'],
                'type': 'scatter',
                'name': 'Price'
            },
            {
                'x': df.index,
                'y': df['MA'],
                'type': 'scatter',
                'name': f'{request.pattern_params.ma_period} MA'
            },
            {
                'x': patterns.index,
                'y': patterns['Close'],
                'mode': 'markers',
                'marker': {
                    'color': 'blue',
                    'size': 10
                },
                'name': 'Elephant Bar Pattern'
            }
        ]
        
        return {
            'chart_data': chart_data,
            'patterns': patterns[['Open', 'High', 'Low', 'Close', 'Volume']].to_dict('records')
        } 