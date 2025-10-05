"""
Three Black Crows Pattern Controller
Controller for handling Three Black Crows pattern analysis requests
"""

from typing import Dict, Any, Tuple
import pandas as pd
from flask import jsonify
from tradinghub.backend.shared.controllers.backtest_controller import BacktestController
from tradinghub.backend.three_candle.patterns.three_black_crows_pattern import ThreeBlackCrowsPattern
from tradinghub.backend.shared.services.stock_service import StockService
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest

class ThreeBlackCrowsController:
    """Controller for Three Black Crows pattern analysis and backtesting"""
    
    def __init__(self):
        self.backtest_controller = BacktestController()
        self.stock_service = StockService()
        self.pattern_detector = ThreeBlackCrowsPattern()
    
    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle pattern analysis request for Three Black Crows patterns
        
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
            
            # Build Three Black Crows-specific parameters
            pattern_params = PatternParams(
                body_size_ratio=float(data.get('body_size_ratio', 0.6)),
                lower_shadow_ratio=float(data.get('lower_shadow_ratio', 0.2)),
                upper_shadow_ratio=0.0,  # Not used for Three Black Crows
                ma_period=int(data.get('ma_period', 20)),
                require_green=False,  # Not used for Three Black Crows
                require_high_volume=False  # Not used for Three Black Crows
            )
            
            # Add Three Black Crows-specific parameters
            require_trend = data.get('require_trend', True)
            progressive_close = data.get('progressive_close', True)
            pattern_params.require_trend = require_trend  # Add as custom attribute
            pattern_params.progressive_close = progressive_close  # Add as custom attribute
            
            # Create analysis request object
            request_obj = AnalysisRequest(
                symbol=symbol,
                days=days,
                interval=interval,
                pattern_type='three_black_crows',
                pattern_params=pattern_params
            )
            
            # Perform analysis using stock service
            result = self.stock_service.analyze_stock(request_obj)
            return jsonify(result.to_dict()), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def backtest(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle backtest request for Three Black Crows patterns
        
        Args:
            data: Request data containing backtest parameters
            
        Returns:
            Tuple containing response data and HTTP status code
        """
        # Use the shared backtest controller
        return self.backtest_controller.run_backtest(data)
