from typing import Dict, Any, List
from tradinghub.models.dto.trade_results import Trade

class PerformanceAnalyzer:
    def __init__(self):
        pass

    def calculate_performance_metrics(self, trades: List[Trade]) -> Dict[str, Any]:
        """Calculate performance metrics from trades"""
        if not trades:
            return {
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'average_profit': 0,
                'total_profit_pct': 0,
                'trades': [],
                'hourly_performance': self._calculate_hourly_performance(trades)
            }
        
        winning_trades = [t for t in trades if t.profit_pct > 0]
        losing_trades = [t for t in trades if t.profit_pct < 0]
        
        total_profit = sum(t.profit_pct for t in trades)
        total_win = sum(t.profit_pct for t in winning_trades)
        total_loss = abs(sum(t.profit_pct for t in losing_trades))
        
        # Ensure we don't divide by zero
        win_rate = len(winning_trades) / len(trades) if trades else 0
        profit_factor = total_win / total_loss if total_loss > 0 else 0
        average_profit = total_profit / len(trades) if trades else 0
        
        return {
            'total_trades': len(trades),
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'average_profit': average_profit,
            'total_profit_pct': total_profit * 100,
            'trades': [
                {
                    'entry_date': t.entry_date.strftime('%Y-%m-%d %H:%M'),
                    'exit_date': t.exit_date.strftime('%Y-%m-%d %H:%M'),
                    'entry_price': t.entry_price,
                    'exit_price': t.exit_price,
                    'profit_pct': t.profit_pct * 100,
                    'profit_amount': t.profit_amount,
                    'commission': t.commission,
                    'slippage_cost': t.slippage_cost,
                    'periods_held': t.periods_held,
                    'exit_reason': t.exit_reason
                }
                for t in trades
            ],
            'hourly_performance': self._calculate_hourly_performance(trades)
        }
        
    def _calculate_hourly_performance(self, trades: List[Trade]) -> Dict[str, Any]:
        """
        Calculate performance metrics by hour of day
        
        Args:
            trades: List of trades to analyze
            
        Returns:
            Dictionary containing hourly performance metrics
        """
        if not trades:
            return {
                'hourly_trades': [0] * 24,
                'hourly_profits': [0] * 24,
                'hourly_win_rates': [0] * 24,
                'hourly_avg_profits': [0] * 24
            }
        
        # Initialize arrays for each hour (0-23)
        hourly_trades = [0] * 24
        hourly_profits = [0] * 24
        hourly_wins = [0] * 24
        
        # Calculate metrics for each hour
        for trade in trades:
            # Extract hour from entry date
            hour = trade.entry_date.hour
            
            # Update counts and profits
            hourly_trades[hour] += 1
            hourly_profits[hour] += trade.profit_pct
            
            if trade.profit_pct > 0:
                hourly_wins[hour] += 1
        
        # Calculate win rates and average profits
        hourly_win_rates = []
        hourly_avg_profits = []
        
        for hour in range(24):
            # Calculate win rate
            win_rate = hourly_wins[hour] / hourly_trades[hour] if hourly_trades[hour] > 0 else 0
            hourly_win_rates.append(win_rate)
            
            # Calculate average profit
            avg_profit = hourly_profits[hour] / hourly_trades[hour] if hourly_trades[hour] > 0 else 0
            hourly_avg_profits.append(avg_profit)
        
        return {
            'hourly_trades': hourly_trades,
            'hourly_profits': hourly_profits,
            'hourly_win_rates': hourly_win_rates,
            'hourly_avg_profits': hourly_avg_profits
        }
