"""
Trade Impact Simulator — computes win distribution delta between two roster states.
"""
from engine.loader import get_player
from engine.stats import build_full_profile
from engine.simulation import simulate_season
from typing import Dict


def simulate_trade(player_out: str, player_in: str, current_team_wins: int = 38) -> Dict:
    """
    Simulate the impact of trading player_out for player_in.
    Runs the Monte Carlo simulation twice and returns the delta.
    """
    # Get full profiles for both players
    profile_out = build_full_profile(player_out)
    profile_in  = build_full_profile(player_in)

    # Simulate BEFORE trade (team without player_in, baseline = current wins)
    before = simulate_season(
        impact_score=profile_out["impact_score"],
        current_team_wins=current_team_wins,
        games_played=profile_out["gp"],
        mpg=profile_out["stats"]["mp"],
    )

    # Simulate AFTER trade (same baseline wins, now with player_in's impact)
    after = simulate_season(
        impact_score=profile_in["impact_score"],
        current_team_wins=current_team_wins,
        games_played=profile_in["gp"],
        mpg=profile_in["stats"]["mp"],
    )

    salary_out = profile_out.get("salary_m", 0.0)
    salary_in  = profile_in.get("salary_m", 0.0)

    return {
        "player_out": {
            "name":         profile_out["player"],
            "position":     profile_out["position"],
            "impact_score": profile_out["impact_score"],
            "salary_m":     salary_out,
        },
        "player_in": {
            "name":         profile_in["player"],
            "position":     profile_in["position"],
            "impact_score": profile_in["impact_score"],
            "salary_m":     salary_in,
        },
        "before": {
            "expected_wins":   before["expected_wins"],
            "playoff_prob":    before["playoff_prob"],
            "win_distribution": before["win_distribution"],
        },
        "after": {
            "expected_wins":   after["expected_wins"],
            "playoff_prob":    after["playoff_prob"],
            "win_distribution": after["win_distribution"],
        },
        "delta": {
            "wins":         round(after["expected_wins"] - before["expected_wins"], 1),
            "playoff_prob": round(after["playoff_prob"]  - before["playoff_prob"],  1),
            "salary_m":     round(salary_in - salary_out, 2),
        },
    }