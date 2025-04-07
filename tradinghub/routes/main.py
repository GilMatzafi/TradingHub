from flask import Blueprint, render_template, request, jsonify
from tradinghub.services.stock_service import StockService
from tradinghub.models.dto.pattern_params import PatternParams, AnalysisRequest
from tradinghub.models.backtest.hammer_backtest import BacktestParams, HammerBacktest
import pandas as pd

# Create blueprint
main_bp = Blueprint('main', __name__)

# Initialize services
stock_service = StockService()

@main_bp.route('/')
def index():
    """Render the strategy introduction page"""
    return render_template('dashboard/index.html')

@main_bp.route('/hammer')
def hammer_analyzer():
    """Render the hammer pattern analyzer page"""
    return render_template('hammer_analyzer/index.html')

@main_bp.route('/analyze', methods=['POST'])
def analyze():
    """Analyze stock data for hammer patterns"""
    try:
        data = request.json
        
        # Create pattern parameters
        pattern_params = PatternParams(
            body_size_ratio=float(data.get('body_size_ratio', 0.3)),
            lower_shadow_ratio=float(data.get('lower_shadow_ratio', 2.0)),
            upper_shadow_ratio=float(data.get('upper_shadow_ratio', 0.1)),
            ma_period=int(data.get('ma_period', 5)),
            require_green=data.get('require_green', True)
        )
        
        # Add volume parameters if they exist in the request
        if 'min_relative_volume' in data:
            pattern_params.min_relative_volume = float(data.get('min_relative_volume', 1.0))
            pattern_params.volume_lookback = int(data.get('volume_lookback', 20))
        
        # Create analysis request
        request_obj = AnalysisRequest(
            symbol=data.get('symbol', 'AAPL'),
            days=int(data.get('days', 50)),
            interval=data.get('interval', '5m'),
            pattern_params=pattern_params
        )
        
        # Perform analysis
        result = stock_service.analyze_stock(request_obj)
        
        return jsonify(result.to_dict())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@main_bp.route('/backtest', methods=['POST'])
def backtest():
    """Run backtest for hammer pattern strategy"""
    try:
        data = request.json
        
        # Create pattern parameters
        pattern_params = PatternParams(
            body_size_ratio=float(data.get('body_size_ratio', 0.3)),
            lower_shadow_ratio=float(data.get('lower_shadow_ratio', 2.0)),
            upper_shadow_ratio=float(data.get('upper_shadow_ratio', 0.1)),
            ma_period=int(data.get('ma_period', 5)),
            require_green=data.get('require_green', True)
        )
        
        # Add volume parameters if they exist in the request
        if 'min_relative_volume' in data:
            pattern_params.min_relative_volume = float(data.get('min_relative_volume', 1.0))
            pattern_params.volume_lookback = int(data.get('volume_lookback', 20))
        
        # Create backtest parameters
        backtest_params = BacktestParams(
            stop_loss_pct=float(data.get('stop_loss_pct', 0.02)),
            take_profit_pct=float(data.get('take_profit_pct', 0.04)),
            entry_delay=int(data.get('entry_delay', 1)),
            max_holding_periods=int(data.get('max_holding_periods', 20)),
            initial_portfolio_size=float(data.get('initial_portfolio_size', 10000)),
            commission=float(data.get('commission', 0.65)),
            slippage_pct=float(data.get('slippage_pct', 0.001))
        )
        
        # Get historical data
        df = stock_service.download_stock_data(
            data.get('symbol', 'AAPL'),
            int(data.get('days', 50)),
            data.get('interval', '5m')
        )
        
        if df.empty:
            return jsonify({'error': 'No data available for the specified parameters'}), 400
        
        # Check if patterns were provided
        patterns = data.get('patterns', [])
        if not patterns:
            return jsonify({'error': 'No patterns provided for backtesting'}), 400
        
        # Convert patterns to DataFrame format
        try:
            patterns_df = pd.DataFrame(patterns)
            if not patterns_df.empty:
                # Convert date strings to datetime objects
                patterns_df['date'] = pd.to_datetime(patterns_df['date'])
                
                # Handle timezone conversion for pattern dates
                israel_tz = 'Asia/Jerusalem'
                
                # If pattern dates have timezone info, convert to Israel timezone
                if patterns_df['date'].dt.tz is not None:
                    patterns_df['date'] = patterns_df['date'].dt.tz_convert(israel_tz)
                else:
                    # If pattern dates are timezone-naive, assume they're in Israel timezone
                    patterns_df['date'] = patterns_df['date'].dt.tz_localize(israel_tz)
                
                # Handle timezone for DataFrame index
                if df.index.tz is not None:
                    # If index has timezone, convert to Israel timezone
                    df.index = df.index.tz_convert(israel_tz)
                else:
                    # If index is timezone-naive, assume it's in Israel timezone
                    df.index = df.index.tz_localize(israel_tz)
                
                # Create a list of pattern dates for matching
                pattern_dates = patterns_df['date'].tolist()
                
                # Mark hammer patterns in the main dataframe
                df['is_hammer'] = False
                for date in pattern_dates:
                    # Find the closest date in the dataframe
                    closest_idx = df.index[df.index.get_indexer([date], method='nearest')[0]]
                    df.loc[closest_idx, 'is_hammer'] = True
                
                # Filter df to only include data around pattern dates
                # Include data before and after each pattern for backtesting
                lookback = max(backtest_params.entry_delay, backtest_params.max_holding_periods)
                pattern_indices = df[df['is_hammer']].index
                
                # Create a mask for rows to include
                include_mask = pd.Series(False, index=df.index)
                for idx in pattern_indices:
                    # Find the position of this index in the dataframe
                    pos = df.index.get_loc(idx)
                    # Include rows before and after the pattern
                    start_pos = max(0, pos - lookback)
                    end_pos = min(len(df), pos + lookback + 1)
                    include_mask.iloc[start_pos:end_pos] = True
                
                # Apply the mask to filter the dataframe
                df = df[include_mask]
                
                if df.empty:
                    return jsonify({'error': 'No matching data found for the provided patterns'}), 400
            else:
                return jsonify({'error': 'Empty patterns data provided'}), 400
        except Exception as e:
            return jsonify({'error': f'Error processing patterns data: {str(e)}'}), 400
        
        # Run backtest
        backtester = HammerBacktest()
        results = backtester.run_backtest(df, pattern_params.__dict__, backtest_params)
        
        # Ensure all required fields are present in the results
        if not results:
            results = {
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'average_profit': 0,
                'total_profit_pct': 0,
                'initial_portfolio_value': backtest_params.initial_portfolio_size,
                'final_portfolio_value': backtest_params.initial_portfolio_size,
                'portfolio_history': [{'date': df.index[0], 'value': backtest_params.initial_portfolio_size}],
                'trades': []
            }
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400 