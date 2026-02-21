"""
Monte Carlo simulation of season outcomes based on impact score.
"""
import numpy as np
from typing import Dict

MIN_GAMES   = 15
MIN_MPG     = 10.0
FULL_SEASON = 82


def _project_impact(impact_score: float, games_played: int, mpg: float) -> float:
    """
    Extrapolate impact_score to full-season equivalent if data is partial.
    For very small samples (< MIN_GAMES or < MIN_MPG) apply confidence discount instead.
    """
    # Small sample — not enough data to trust, apply confidence discount
    if games_played < MIN_GAMES or mpg < MIN_MPG:
        sample_ratio = min(games_played / MIN_GAMES, mpg / MIN_MPG)
        return impact_score * sample_ratio

    # Partial season but enough games — project to 82
    # impact_score is already per-game based, so no scaling needed here.
    # wins_added projection happens in valuation.py via _project_wins.
    return impact_score


def simulate_season(
    impact_score: float,
    current_team_wins: int = 38,
    n: int = 10000,
    games_played: int = 82,
    mpg: float = 30.0,
) -> Dict:
    """
    Simulate season using logistic model based on impact score.

    Args:
        impact_score:       Player's computed impact score
        current_team_wins:  Current team's projected wins (default 38)
        n:                  Number of simulations (default 10000)
        games_played:       Games played this season
        mpg:                Minutes per game
    """
    adjusted_impact = _project_impact(impact_score, games_played, mpg)
    is_projected = bool(games_played < FULL_SEASON and games_played >= MIN_GAMES)

    baseline_rate = current_team_wins / 82
    baseline_rate = float(np.clip(baseline_rate, 0.01, 0.99))

    logit_baseline = np.log(baseline_rate / (1 - baseline_rate))
    adjusted_logit = logit_baseline + adjusted_impact * 0.65
    win_prob = float(1 / (1 + np.exp(-adjusted_logit)))
    win_prob = float(np.clip(win_prob, 0.01, 0.99))

    simulations = np.random.binomial(82, win_prob, n)

    return {
        "expected_wins":    round(float(simulations.mean()), 1),
        "wins_added":       round(float(simulations.mean()) - current_team_wins, 1),
        "win_range_low":    int(np.percentile(simulations, 5)),
        "win_range_high":   int(np.percentile(simulations, 95)),
        "playoff_prob":     round(float((simulations >= 41).mean() * 100), 1),
        "win_distribution": [int(x) for x in simulations],
        "is_projected":     is_projected,
    }