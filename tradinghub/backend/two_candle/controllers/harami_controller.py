"""
Harami Pattern Controller
Controller for handling Harami pattern analysis requests
"""

from typing import Dict, Any, Tuple
import pandas as pd
from flask import jsonify
from tradinghub.backend.shared.controllers.backtest_controller import BacktestController
from tradinghub.backend.two_candle.patterns.harami_pattern import HaramiPattern
from tradinghub.backend.shared.services.stock_service import StockService
from tradinghub.backend.shared.models.dto.pattern_params import PatternParams, AnalysisRequest

class HaramiController:
    """Controller for Harami pattern analysis and backtesting"""
    
    def __init__(self):
        self.stock_service = StockService()
        self.pattern_detector = HaramiPattern()
        self.backtest_controller = BacktestController()
    
    def analyze(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle Harami pattern analysis request

        Args:
            data: Request JSON payload from the client

        Returns:
            Tuple of (JSON response, HTTP status code)
        """
        try:
            # Get stock data
            symbol = data.get('symbol', 'AAPL')
            days = int(data.get('days', 50))
            interval = data.get('interval', '5m')
            
            # Build harami-specific parameters
            pattern_params = PatternParams(
                body_size_ratio=float(data.get('body_size_ratio', 0.3)),
                lower_shadow_ratio=0.0,  # Not used for harami
                upper_shadow_ratio=0.0,  # Not used for harami
                ma_period=int(data.get('ma_period', 20)),
                require_green=False,  # Not used for harami
                require_high_volume=False  # Not used for harami
            )
            
            # Add harami-specific parameters
            harami_type = data.get('harami_type', 'both')
            require_trend = data.get('require_trend', True)
            pattern_params.harami_type = harami_type  # Add as custom attribute
            pattern_params.require_trend = require_trend  # Add as custom attribute
            
            # Create analysis request object
            request_obj = AnalysisRequest(
                symbol=symbol,
                days=days,
                interval=interval,
                pattern_type='harami',
                pattern_params=pattern_params
            )
            
            # Perform analysis using stock service
            result = self.stock_service.analyze_stock(request_obj)
            return jsonify(result.to_dict()), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    def backtest(self, data: Dict[str, Any]) -> Tuple[Any, int]:
        """
        Handle Harami pattern backtesting request

        Args:
            data: Request JSON payload from the client

        Returns:
            Tuple of (JSON response, HTTP status code)
        """
        try:
            # Use the shared backtest controller
            return self.backtest_controller.run_backtest(data, 'harami')
        except Exception as e:
            return jsonify({'error': str(e)}), 500
