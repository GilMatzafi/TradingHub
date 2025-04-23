from flask import request, jsonify
import pandas as pd
from tradinghub.models.dto.backtest_params import BacktestParams
from tradinghub.backtest.hammer_backtest import HammerBacktest

@app.route('/backtest', methods=['POST'])
def backtest():
    try:
        data = request.get_json()
        
        # Get pattern parameters
        pattern_params = {
            'body_size_ratio': float(data.get('body_size_ratio', 0.6)),
            'lower_shadow_ratio': float(data.get('lower_shadow_ratio', 2.0)),
            'upper_shadow_ratio': float(data.get('upper_shadow_ratio', 0.1)),
            'ma_period': int(data.get('ma_period', 20)),
            'require_green': bool(data.get('require_green', True))
        }
        
        # Add volume parameters if provided
        if 'min_relative_volume' in data and 'volume_lookback' in data:
            pattern_params['min_relative_volume'] = float(data['min_relative_volume'])
            pattern_params['volume_lookback'] = int(data['volume_lookback'])
        
        # Get backtest parameters
        backtest_params = BacktestParams(
            stop_loss_pct=float(data.get('stop_loss_pct', 0.02)),
            take_profit_pct=float(data.get('take_profit_pct', 0.04)),
            entry_delay=int(data.get('entry_delay', 1)),
            max_holding_periods=int(data.get('max_holding_periods', 20)),
            initial_portfolio_size=float(data.get('initial_portfolio_size', 10000)),
            commission=float(data.get('commission', 0.65)),  # Default commission of $0.65 per trade
            slippage_pct=float(data.get('slippage_pct', 0.001))  # Default slippage of 0.1%
        )
        
        # Get the patterns from the request
        patterns = data.get('patterns', [])
        
        # Create DataFrame from patterns
        df = pd.DataFrame(patterns)
        if df.empty:
            return jsonify({'error': 'No patterns provided for backtest'})
        
        # Convert date strings to datetime
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)
        
        # Run backtest
        backtest = HammerBacktest()
        results = backtest.run_backtest(df, pattern_params, backtest_params)
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({'error': str(e)}) 