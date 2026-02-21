"""
Monte Carlo simulation of season outcomes based on impact score.
"""
import numpy as np
from typing import Dict

MIN_GAMES = 15
MIN_MPG   = 10.0

def simulate_season(
    impact_score: float,
    current_team_wins: int = 38,
    n: int = 10000,
    games_played: int = 82,
    mpg: float = 30.0,
) -> Dict:
    """
    Simulate season using logistic model based on impact score.

    For players with a small sample (< MIN_GAMES or < MIN_MPG) the
    impact_score is discounted proportionally before the simulation so
    that wins_added (and therefore fair_value) reflect the uncertainty.

    Args:
        impact_score:       Player's computed impact score
        current_team_wins:  Current team's projected wins (default 38)
        n:                  Number of simulations (default 10000)
        games_played:       Games played this season (for small-sample check)
        mpg:                Minutes per game (for small-sample check)
    """
    # Small-sample confidence discount
    # e.g. 2 games → ratio = 2/15 ≈ 0.13 → impact scaled down to 13 %
    if games_played < MIN_GAMES or mpg < MIN_MPG:
        sample_ratio = min(games_played / MIN_GAMES, mpg / MIN_MPG)
        impact_score = impact_score * sample_ratio

    baseline_rate = current_team_wins / 82
    baseline_rate = float(np.clip(baseline_rate, 0.01, 0.99))

    # Logit transform so impact_score=0 means zero change
    logit_baseline = np.log(baseline_rate / (1 - baseline_rate))
    adjusted_logit = logit_baseline + impact_score * 0.65
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
    }
