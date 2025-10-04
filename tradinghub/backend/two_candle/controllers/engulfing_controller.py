"""
Engulfing Pattern Controller
Controller for handling Engulfing pattern analysis requests
"""

from typing import Dict, Any, Tuple
from flask import jsonify
from tradinghub.backend.shared.controllers.backtest_controller import BacktestController
from tradinghub.backend.two_candle.patterns.engulfing_pattern import EngulfingPattern
from tradinghub.backend.shared.services.stock_service import StockService

class EngulfingController:
    """Controller for Engulfing pattern analysis and backtesting"""
    
    def __init__(self):
        self.backtest_controller = BacktestController()
        self.stock_service = StockService()
        self.pattern_detector = EngulfingPattern()
    
    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle pattern analysis request for Engulfing patterns
        
        Args:
            data: Request data containing analysis parameters
            
        Returns:
            Tuple containing response data and HTTP status code
        """
        try:
            # Get stock data
            symbol = data.get('symbol', 'AAPL')
            days = int(data.get('days', 50))
            interval = data.get('interval', '5m')
            
            # Get pattern parameters
            pattern_params = {
                'body_size_ratio': float(data.get('body_size_ratio', 0.3)),
                'engulfing_type': data.get('engulfing_type', 'both'),
                'ma_period': int(data.get('ma_period', 20)),
                'require_trend': data.get('require_trend', True)
            }
            
            # Get stock data
            df = self.stock_service.get_stock_data(symbol, days, interval)
            
            # Detect patterns
            df = self.pattern_detector.detect(df, pattern_params)
            
            # Filter to only show rows with patterns
            pattern_rows = df[df['is_engulfing']].copy()
            
            # Prepare response
            results = {
                'symbol': symbol,
                'pattern_type': 'engulfing',
                'total_patterns': len(pattern_rows),
                'data_points': len(df),
                'patterns': pattern_rows.to_dict('records') if len(pattern_rows) > 0 else [],
                'parameters': pattern_params
            }
            
            return jsonify(results), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def backtest(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle backtest request for Engulfing patterns
        
        Args:
            data: Request data containing backtest parameters
            
        Returns:
            Tuple containing response data and HTTP status code
        """
        # Use the shared backtest controller
        return self.backtest_controller.run_backtest(data)
