from flask import Blueprint, render_template, request, jsonify
from tradinghub.services.stock_service import StockService
from tradinghub.utils.time_utils import convert_to_israel_time
from datetime import datetime, timedelta

# Create blueprint
main_bp = Blueprint('main', __name__)

# Initialize services
stock_service = StockService()

@main_bp.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@main_bp.route('/analyze', methods=['POST'])
def analyze():
    """Analyze stock data for hammer patterns"""
    data = request.json
    
    # Extract parameters from request
    symbol = data.get('symbol', 'AAPL')
    days = int(data.get('days', 50))
    interval = data.get('interval', '5m')
    
    # Strategy parameters
    strategy_params = {
        'body_size_ratio': float(data.get('body_size_ratio', 0.3)),
        'lower_shadow_ratio': float(data.get('lower_shadow_ratio', 2.0)),
        'upper_shadow_ratio': float(data.get('upper_shadow_ratio', 0.1)),
        'ma_period': int(data.get('ma_period', 5)),
        'require_green': data.get('require_green', True)
    }
    
    # Calculate date range
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    
    # Download and analyze data
    df = stock_service.download_stock_data(symbol, start_date, end_date, interval)
    
    if df.empty:
        return jsonify({'error': 'No data found. Please check the symbol and date range.'})
    
    df = stock_service.detect_hammer_patterns(df, strategy_params)
    
    # Find hammer patterns
    hammers = df[df['is_hammer']]
    
    # Prepare results
    results = []
    for date, row in hammers.iterrows():
        israel_time = convert_to_israel_time(date)
        results.append({
            'date': israel_time.strftime('%Y-%m-%d %H:%M'),
            'trend': row['trend'],
            'open': float(row['Open']),
            'high': float(row['High']),
            'low': float(row['Low']),
            'close': float(row['Close'])
        })
    
    return jsonify({
        'count': len(results),
        'patterns': results
    }) 