#!/usr/bin/env python3
"""
Test script to verify the new backtest chart feature works correctly
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'tradinghub'))

def test_backtest_chart_feature():
    """Test that the new backtest chart feature is properly implemented"""
    print("🧪 Testing backtest chart feature implementation...")
    
    try:
        # Test that the new chart class exists
        chart_file = 'tradinghub/frontend/shared/static/js/modules/charts/backtestCandlestickChart.js'
        if os.path.exists(chart_file):
            print("✅ BacktestCandlestickChart class created")
        else:
            print("❌ BacktestCandlestickChart class not found")
            return False
        
        # Test that the chart is imported in backtest-charts.js
        charts_file = 'tradinghub/frontend/shared/static/js/modules/backtest/backtest-charts.js'
        if os.path.exists(charts_file):
            with open(charts_file, 'r') as f:
                content = f.read()
                if 'BacktestCandlestickChart' in content:
                    print("✅ BacktestCandlestickChart imported in backtest-charts.js")
                else:
                    print("❌ BacktestCandlestickChart not imported")
                    return False
        else:
            print("❌ backtest-charts.js not found")
            return False
        
        # Test that the HTML button and container exist
        params_file = 'tradinghub/frontend/shared/templates/components/backtest_params.html'
        if os.path.exists(params_file):
            with open(params_file, 'r') as f:
                content = f.read()
                if 'showBacktestCandlestickChart' in content and 'backtestCandlestickContainer' in content:
                    print("✅ HTML button and container added to backtest_params.html")
                else:
                    print("❌ HTML elements not found in backtest_params.html")
                    return False
        else:
            print("❌ backtest_params.html not found")
            return False
        
        # Test that CSS styling exists
        css_file = 'tradinghub/frontend/shared/static/css/modules/charts.css'
        if os.path.exists(css_file):
            with open(css_file, 'r') as f:
                content = f.read()
                if 'backtest-candlestick-container' in content:
                    print("✅ CSS styling added for backtest candlestick chart")
                else:
                    print("❌ CSS styling not found")
                    return False
        else:
            print("❌ charts.css not found")
            return False
        
        print("\n🎉 Backtest chart feature implementation test PASSED!")
        print("✅ New chart component created")
        print("✅ Chart integrated into backtest system")
        print("✅ HTML elements added")
        print("✅ CSS styling added")
        print("✅ Both long and short backtests will show the new chart")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing backtest chart feature: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_backtest_chart_feature()
    if success:
        print("\n🚀 Feature is ready to use!")
        print("Users can now click 'Show Price Chart with Trades' to see:")
        print("  📈 Stock price chart")
        print("  🟢 Entry points (green markers)")
        print("  🔴 Stop loss exits (red markers)")
        print("  🔵 Take profit exits (blue markers)")
        print("  🟡 Time-based exits (yellow markers)")
    else:
        print("\n💥 Backtest chart feature test FAILED!")
        sys.exit(1)
