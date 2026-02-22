"""
Contract valuation based on wins added, with injury risk adjustment.
"""
from typing import Dict, Optional

VALUE_PER_WIN    = 3.8   # $M per win — Berri & Schmidt 2010
FULL_SEASON      = 82
INJURY_GP_THRESH = 60    # below this — likely missed games due to injury
INJURY_MPG_THRESH = 25   # high mpg + low gp = injury, not rotation


def _detect_absence_reason(gp: int, mpg: float) -> str:
    """
    Determine why a player has fewer than 82 games.

    Returns:
        'injury'   — high mpg but low gp → missed games due to injury
        'partial'  — season still in progress or rotation player
        'full'     — played full season
    """
    if gp >= FULL_SEASON:
        return 'full'
    if mpg >= INJURY_MPG_THRESH and gp < INJURY_GP_THRESH:
        return 'injury'
    return 'partial'


def _project_wins(wins_added: float, gp: int, mpg: float) -> tuple:
    """
    Project wins_added to full season only if absence is NOT injury-related.

    Returns (projected_wins, is_projected, absence_reason).
    """
    reason = _detect_absence_reason(gp, mpg)

    if reason == 'injury':
        return wins_added, False, reason

    if reason == 'partial':
        projected = round(wins_added * (FULL_SEASON / gp), 2) if gp > 0 else wins_added
        return projected, True, reason

    return wins_added, False, reason


def _durability_score(age, gp: int) -> tuple:
    """
    Compute a durability multiplier in [0, 1] based on age and games played.
    Returns (score, risk_label).
    """
    if age is None or age == 'N/A' or age == 0:
        age_factor = 0.95
        age_val = None
    else:
        age_val = float(age)
        if age_val < 27:
            age_factor = 1.00
        elif age_val < 31:
            age_factor = 0.97
        elif age_val < 34:
            age_factor = 0.92
        elif age_val < 37:
            age_factor = 0.85
        else:
            age_factor = 0.75

    availability = min(1.0, gp / 82) if gp and gp > 0 else 0.5
    score = round(availability * age_factor, 3)

    if score >= 0.85:
        risk_label = "LOW RISK"
    elif score >= 0.70:
        risk_label = "MODERATE RISK"
    elif score >= 0.50:
        if age_val is not None and age_val < 27:
            risk_label = "INJURY SEASON"
        else:
            risk_label = "HIGH RISK"
    else:
        if age_val is not None and age_val < 27:
            risk_label = "HIGH RISK"
        else:
            risk_label = "VERY HIGH RISK"

    return score, risk_label


def calculate_value(
    wins_added: float,
    requested_salary_m: float,
    value_per_win: float = VALUE_PER_WIN,
    age=None,
    gp: int = 82,
    mpg: float = 30.0,
) -> Dict:
    projected_wins, is_projected, absence_reason = _project_wins(wins_added, gp, mpg)

    fair_value = round(projected_wins * value_per_win, 2)
    dur_score, risk_label = _durability_score(age, gp)
    health_adjusted_value = round(fair_value * dur_score, 2)
    durability_discount_pct = round((1 - dur_score) * 100, 1)

    base = {
        "durability_score":         dur_score,
        "durability_discount_pct":  durability_discount_pct,
        "risk_label":               risk_label,
        "projected_wins":           projected_wins,
        "is_projected":             is_projected,
        "absence_reason":           absence_reason,
    }

    # FIX: не обрезаем в 0 — отрицательное значение честно показывает что игрок вреден
    if projected_wins <= 0 or fair_value <= 0:
        efficiency = round(fair_value / requested_salary_m, 3) if requested_salary_m > 0 else None
        overpay = (
            round((requested_salary_m - fair_value) / requested_salary_m * 100, 1)
            if requested_salary_m > 0 else None
        )
        return {
            **base,
            "fair_value_m":            fair_value,
            "efficiency_ratio":        efficiency,
            "overpay_pct":             overpay,
            "decision":                "AVOID",
            "health_adjusted_value_m": health_adjusted_value,
        }

    if requested_salary_m <= 0:
        return {
            **base,
            "fair_value_m":            fair_value,
            "efficiency_ratio":        None,
            "overpay_pct":             None,
            "decision":                "NEGOTIATE",
            "health_adjusted_value_m": health_adjusted_value,
        }

    efficiency_ratio = round(fair_value / requested_salary_m, 3)
    overpay_raw = (requested_salary_m - fair_value) / fair_value * 100
    overpay_pct = None if overpay_raw > 9999 else round(overpay_raw, 1)
    health_efficiency = round(health_adjusted_value / requested_salary_m, 3)

    if health_efficiency >= 1.0:
        decision = "SIGN"
    elif health_efficiency >= 0.50:
        decision = "NEGOTIATE"
    else:
        decision = "AVOID"

    return {
        **base,
        "fair_value_m":             fair_value,
        "efficiency_ratio":         efficiency_ratio,
        "overpay_pct":              overpay_pct,
        "decision":                 decision,
        "health_adjusted_value_m":  health_adjusted_value,
    }