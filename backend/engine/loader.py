import pandas as pd
import os
from fuzzywuzzy import fuzz, process
from typing import Optional, Dict, List

def load_data():
    """Load NBA stats and salary data from CSV files"""
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_dir = os.path.join(base_dir, "data")
    
    stats_path = os.path.join(data_dir, "nba_stats_2324.csv")
    salary_path = os.path.join(data_dir, "nba_salary_2324.csv")
    
    if not os.path.exists(stats_path):
        raise FileNotFoundError(f"Stats file not found: {stats_path}")
    if not os.path.exists(salary_path):
        raise FileNotFoundError(f"Salary file not found: {salary_path}")
    
    stats_df = pd.read_csv(stats_path)
    salary_df = pd.read_csv(salary_path)
    
    return stats_df, salary_df

def get_player(player_name: str, stats_df: pd.DataFrame, salary_df: pd.DataFrame) -> Optional[Dict]:
    """Get player data by name with fuzzy matching"""
    # Try exact match first
    player_stats = stats_df[stats_df["Player"].str.contains(player_name, case=False, na=False)]
    
    if player_stats.empty:
        # Use fuzzy matching
        player_names = stats_df["Player"].unique()
        match = process.extractOne(player_name, player_names, scorer=fuzz.ratio)
        if match and match[1] >= 70:  # 70% similarity threshold
            player_name = match[0]
            player_stats = stats_df[stats_df["Player"] == player_name]
        else:
            return None
    
    if player_stats.empty:
        return None
    
    player_row = player_stats.iloc[0]
    player_dict = player_row.to_dict()
    
    # Merge salary data if available
    player_salary = salary_df[salary_df["Player"].str.contains(player_name, case=False, na=False)]
    if not player_salary.empty:
        salary_row = player_salary.iloc[0]
        player_dict["salary"] = salary_row.get("Salary", 0)
        player_dict["contract_years"] = salary_row.get("Years", 0)
    
    return player_dict

def search_players(query: str, stats_df: pd.DataFrame, limit: int = 10) -> List[Dict]:
    """Fuzzy search for players"""
    if not query or len(query) < 2:
        return []
    
    player_names = stats_df["Player"].unique().tolist()
    
    # Get fuzzy matches
    matches = process.extract(query, player_names, limit=limit, scorer=fuzz.ratio)
    
    results = []
    for match_name, score, _ in matches:
        if score >= 60:  # 60% similarity threshold
            player = get_player(match_name, stats_df, pd.DataFrame())
            if player:
                results.append({
                    "name": match_name,
                    "score": score
                })
    
    return results[:limit]
