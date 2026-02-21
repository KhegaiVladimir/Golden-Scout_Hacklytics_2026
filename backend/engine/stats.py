import pandas as pd
import numpy as np
from typing import Dict, List

# Key stats for analysis
STAT_COLUMNS = [
    "PTS", "TRB", "AST", "STL", "BLK", "FG%", "3P%", "FT%", 
    "PER", "TS%", "USG%", "WS", "BPM", "VORP"
]

def calculate_z_scores(player: Dict, stats_df: pd.DataFrame) -> Dict[str, float]:
    """Calculate z-scores for key stats"""
    z_scores = {}
    
    for stat in STAT_COLUMNS:
        if stat in player and stat in stats_df.columns:
            player_value = player[stat]
            if pd.isna(player_value):
                z_scores[stat] = 0.0
                continue
            
            mean = stats_df[stat].mean()
            std = stats_df[stat].std()
            
            if std > 0:
                z_scores[stat] = (player_value - mean) / std
            else:
                z_scores[stat] = 0.0
    
    return z_scores

def calculate_impact_score(player: Dict, stats_df: pd.DataFrame) -> float:
    """Calculate overall impact score (weighted combination of stats)"""
    weights = {
        "PTS": 0.15,
        "TRB": 0.10,
        "AST": 0.15,
        "STL": 0.10,
        "BLK": 0.10,
        "PER": 0.15,
        "WS": 0.10,
        "BPM": 0.10,
        "VORP": 0.05
    }
    
    z_scores = calculate_z_scores(player, stats_df)
    impact = sum(z_scores.get(stat, 0) * weight for stat, weight in weights.items())
    
    return impact

def calculate_percentile(player: Dict, stats_df: pd.DataFrame) -> Dict[str, float]:
    """Calculate percentiles for key stats"""
    percentiles = {}
    
    for stat in STAT_COLUMNS:
        if stat in player and stat in stats_df.columns:
            player_value = player[stat]
            if pd.isna(player_value):
                percentiles[stat] = 0.0
                continue
            
            percentile = (stats_df[stat] < player_value).sum() / len(stats_df) * 100
            percentiles[stat] = percentile
    
    return percentiles

def calculate_cv(player: Dict, stats_df: pd.DataFrame) -> float:
    """Calculate coefficient of variation (consistency metric)"""
    # Use game-to-game variance if available, otherwise use stat variance
    # For simplicity, using overall stat variance
    key_stats = ["PTS", "TRB", "AST"]
    cvs = []
    
    for stat in key_stats:
        if stat in player and stat in stats_df.columns:
            player_value = player[stat]
            if pd.isna(player_value):
                continue
            
            mean = stats_df[stat].mean()
            std = stats_df[stat].std()
            
            if mean > 0:
                cv = std / mean
                cvs.append(cv)
    
    return np.mean(cvs) if cvs else 0.0

def calculate_trend(player: Dict, stats_df: pd.DataFrame) -> str:
    """Calculate trend: HOT, STEADY, or COLD"""
    # Simplified trend calculation based on recent performance
    # In a real implementation, you'd compare recent games to season average
    
    impact_score = calculate_impact_score(player, stats_df)
    
    if impact_score > 0.5:
        return "HOT"
    elif impact_score < -0.5:
        return "COLD"
    else:
        return "STEADY"
