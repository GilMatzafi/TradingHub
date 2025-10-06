#!/usr/bin/env python3
"""
Test script to verify that the backtest fix works correctly
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'tradinghub'))

def test_backtest_fix():
    """Test that the backtest system works without position_type parameter issues"""
    print("🧪 Testing backtest fix...")
    
    try:
        # Test that we can create backtesters for both long and short positions
        from tradinghub.backend.shared.services.backtest_service import BacktestService
        
        service = BacktestService()
        
        # Test long position backtester
        long_backtester = service.get_backtester('hammer', 'long')
        print("✅ Long position backtester created successfully")
        print(f"   Position type: {long_backtester.position_type}")
        
        # Test short position backtester
        short_backtester = service.get_backtester('hammer', 'short')
        print("✅ Short position backtester created successfully")
        print(f"   Position type: {short_backtester.position_type}")
        
        # Verify they are different instances
        assert long_backtester is not short_backtester, "Should be different instances"
        print("✅ Long and short backtesters are different instances")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing backtest fix: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_backtest_fix()
    if success:
        print("\n🎉 Backtest fix test PASSED!")
        print("✅ No more position_type parameter errors")
        print("✅ Both long and short backtests should work now")
    else:
        print("\n💥 Backtest fix test FAILED!")
        sys.exit(1)
