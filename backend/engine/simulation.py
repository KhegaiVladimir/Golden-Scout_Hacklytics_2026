import pandas as pd
import numpy as np
from typing import Dict, List

def simulate_season(
    player: Dict, 
    stats_df: pd.DataFrame, 
    n_simulations: int = 1000
) -> Dict:
    """Monte Carlo simulation of season outcomes"""
    
    # Key stats to simulate
    key_stats = ["PTS", "TRB", "AST", "STL", "BLK"]
    
    # Get player's current stats
    player_stats = {}
    for stat in key_stats:
        if stat in player:
            player_stats[stat] = player[stat]
        else:
            player_stats[stat] = 0
    
    # Calculate mean and std for each stat from league data
    stat_params = {}
    for stat in key_stats:
        if stat in stats_df.columns:
            mean = stats_df[stat].mean()
            std = stats_df[stat].std()
            stat_params[stat] = {"mean": mean, "std": std}
    
    # Simulate wins based on player performance
    # Simplified model: wins correlate with player's impact
    wins_distribution = []
    
    for _ in range(n_simulations):
        # Simulate player performance
        simulated_stats = {}
        total_impact = 0
        
        for stat, params in stat_params.items():
            # Use player's value as mean, with some variance
            player_value = player_stats.get(stat, params["mean"])
            simulated_value = np.random.normal(player_value, params["std"] * 0.3)
            simulated_stats[stat] = max(0, simulated_value)
            
            # Weighted impact
            weights = {"PTS": 0.3, "TRB": 0.2, "AST": 0.3, "STL": 0.1, "BLK": 0.1}
            total_impact += simulated_value * weights.get(stat, 0.1)
        
        # Convert impact to wins (simplified model)
        # Base wins around 41 (0.500), adjust based on impact
        base_wins = 41
        impact_adjustment = (total_impact - 50) / 10  # Rough scaling
        simulated_wins = int(np.clip(base_wins + impact_adjustment, 0, 82))
        
        wins_distribution.append(simulated_wins)
    
    # Calculate statistics
    wins_array = np.array(wins_distribution)
    
    return {
        "wins_distribution": wins_distribution,
        "mean_wins": float(np.mean(wins_array)),
        "median_wins": float(np.median(wins_array)),
        "std_wins": float(np.std(wins_array)),
        "min_wins": int(np.min(wins_array)),
        "max_wins": int(np.max(wins_array)),
        "percentile_25": float(np.percentile(wins_array, 25)),
        "percentile_75": float(np.percentile(wins_array, 75))
    }
