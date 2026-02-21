"""
Contract valuation based on wins added.
"""
from typing import Dict

VALUE_PER_WIN = 3.8  # $M per win — Berri & Schmidt 2010

def calculate_value(wins_added: float, requested_salary_m: float, value_per_win: float = VALUE_PER_WIN) -> Dict:
    """
    Calculate contract value and efficiency.
    
    Args:
        wins_added: Expected wins added by player
        requested_salary_m: Requested salary in millions
        value_per_win: Dollar value per win (default 3.8)
    
    Returns:
        Dictionary with valuation metrics and decision
    """
    fair_value = round(wins_added * value_per_win, 2)
    
    # Handle edge cases
    if requested_salary_m <= 0:
        return {
            "fair_value_m": fair_value,
            "efficiency_ratio": 0.0,
            "overpay_pct": 0.0,
            "decision": "NEGOTIATE"
        }
    
    efficiency_ratio = round(fair_value / requested_salary_m, 3)
    overpay_pct = round((requested_salary_m - fair_value) / max(fair_value, 0.01) * 100, 1)
    
    if efficiency_ratio >= 1.0:
        decision = "SIGN"
    elif efficiency_ratio >= 0.7:
        decision = "NEGOTIATE"
    else:
        decision = "AVOID"
    
    return {
        "fair_value_m": fair_value,
        "efficiency_ratio": efficiency_ratio,
        "overpay_pct": overpay_pct,
        "decision": decision
    }
