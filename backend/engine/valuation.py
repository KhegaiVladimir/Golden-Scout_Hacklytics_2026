"""
Contract valuation based on wins added.
"""
from typing import Dict, Optional

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

    # Negative or zero wins → no value, AVOID
    if wins_added <= 0 or fair_value <= 0:
        return {
            "fair_value_m": 0.0,
            "efficiency_ratio": None,   # Frontend renders as "N/A"
            "overpay_pct": None,
            "decision": "AVOID"
        }

    # Handle edge cases for salary
    if requested_salary_m <= 0:
        return {
            "fair_value_m": fair_value,
            "efficiency_ratio": None,
            "overpay_pct": None,
            "decision": "NEGOTIATE"
        }

    efficiency_ratio = round(fair_value / requested_salary_m, 3)
    overpay_raw = (requested_salary_m - fair_value) / fair_value * 100

    # Cap absurd percentages (>9999%) so they don't break the UI
    if overpay_raw > 9999:
        overpay_pct = None
    else:
        overpay_pct = round(overpay_raw, 1)

    if efficiency_ratio >= 1.0:
        decision = "SIGN"
    elif efficiency_ratio >= 0.50:
        decision = "NEGOTIATE"
    else:
        decision = "AVOID"

    return {
        "fair_value_m": fair_value,
        "efficiency_ratio": efficiency_ratio,
        "overpay_pct": overpay_pct,
        "decision": decision
    }
