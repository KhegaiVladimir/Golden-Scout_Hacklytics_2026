"""
Contract valuation based on wins added, with injury risk adjustment.
"""
from typing import Dict, Optional

VALUE_PER_WIN = 3.8  # $M per win — Berri & Schmidt 2010


def _durability_score(age, gp: int) -> float:
    """
    Compute a durability multiplier in [0, 1] based on age and games played.
    GP/82 gives availability ratio; age curve discounts for injury-prone years.
    """
    # Age factor
    if age is None or age == 'N/A' or age == 0:
        age_factor = 0.95  # unknown age — slight conservative discount
    else:
        age = float(age)
        if age < 27:
            age_factor = 1.00
        elif age < 31:
            age_factor = 0.97
        elif age < 34:
            age_factor = 0.92
        elif age < 37:
            age_factor = 0.85
        else:
            age_factor = 0.75

    # Availability ratio (cap at 1.0 for players who played all 82)
    availability = min(1.0, gp / 82) if gp and gp > 0 else 0.5

    return round(availability * age_factor, 3)


def calculate_value(
    wins_added: float,
    requested_salary_m: float,
    value_per_win: float = VALUE_PER_WIN,
    age=None,
    gp: int = 82,
) -> Dict:
    """
    Calculate contract value, efficiency, and health-adjusted value.

    Args:
        wins_added:          Expected wins added by player
        requested_salary_m:  Requested salary in millions
        value_per_win:       Dollar value per win (default 3.8)
        age:                 Player age (for durability discount)
        gp:                  Games played (for availability ratio)
    """
    fair_value = round(wins_added * value_per_win, 2)

    # Compute durability regardless of other edge cases
    dur_score = _durability_score(age, gp)
    health_adjusted_value = round(fair_value * dur_score, 2)
    durability_discount_pct = round((1 - dur_score) * 100, 1)

    # Negative or zero wins → no value, AVOID
    if wins_added <= 0 or fair_value <= 0:
        return {
            "fair_value_m":             0.0,
            "efficiency_ratio":         None,
            "overpay_pct":              None,
            "decision":                 "AVOID",
            "durability_score":         dur_score,
            "durability_discount_pct":  durability_discount_pct,
            "health_adjusted_value_m":  0.0,
        }

    # Handle edge cases for salary
    if requested_salary_m <= 0:
        return {
            "fair_value_m":             fair_value,
            "efficiency_ratio":         None,
            "overpay_pct":              None,
            "decision":                 "NEGOTIATE",
            "durability_score":         dur_score,
            "durability_discount_pct":  durability_discount_pct,
            "health_adjusted_value_m":  health_adjusted_value,
        }

    efficiency_ratio = round(fair_value / requested_salary_m, 3)
    overpay_raw = (requested_salary_m - fair_value) / fair_value * 100

    if overpay_raw > 9999:
        overpay_pct = None
    else:
        overpay_pct = round(overpay_raw, 1)

    # Decision uses health-adjusted value for more conservative signal
    health_efficiency = round(health_adjusted_value / requested_salary_m, 3)

    if health_efficiency >= 1.0:
        decision = "SIGN"
    elif health_efficiency >= 0.50:
        decision = "NEGOTIATE"
    else:
        decision = "AVOID"

    return {
        "fair_value_m":             fair_value,
        "efficiency_ratio":         efficiency_ratio,
        "overpay_pct":              overpay_pct,
        "decision":                 decision,
        "durability_score":         dur_score,
        "durability_discount_pct":  durability_discount_pct,
        "health_adjusted_value_m":  health_adjusted_value,
    }