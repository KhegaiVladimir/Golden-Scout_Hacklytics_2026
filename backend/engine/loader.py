"""
Loads and merges CSVs once at import time.
Aggregates game-by-game data into per-player season averages.
"""
import pandas as pd
import numpy as np
import os
from fuzzywuzzy import process
from typing import Dict, List

# Position mapping — use exact names from CSV (including Unicode)
POSITION_MAP = {
    # PG
    "Stephen Curry": "PG", "Luka Dončić": "PG", "Tyrese Haliburton": "PG",
    "Damian Lillard": "PG", "Trae Young": "PG", "LaMelo Ball": "PG",
    "Jalen Brunson": "PG", "De'Aaron Fox": "PG", "Shai Gilgeous-Alexander": "PG",
    "Chris Paul": "PG", "Fred VanVleet": "PG", "Ja Morant": "PG",
    "Cade Cunningham": "PG", "James Harden": "PG", "Tyrese Maxey": "PG",
    "Darius Garland": "PG", "Dejounte Murray": "PG", "Immanuel Quickley": "PG",
    "Cole Anthony": "PG", "Dennis Schröder": "PG", "Coby White": "PG",
    "Jamal Murray": "PG", "Kyle Lowry": "PG", "Elfrid Payton": "PG",
    "Monte Morris": "PG", "Tre Jones": "PG",
    # SG
    "Devin Booker": "SG", "Donovan Mitchell": "SG", "Bradley Beal": "SG",
    "Zach LaVine": "SG", "Anthony Edwards": "SG", "Jaylen Brown": "SG",
    "Klay Thompson": "SG", "Jordan Poole": "SG", "Tyler Herro": "SG",
    "Kyrie Irving": "SG", "CJ McCollum": "SG", "Jalen Green": "SG",
    "Cam Thomas": "SG", "Norman Powell": "SG", "Brandon Miller": "SG",
    "Bogdan Bogdanović": "SG", "Josh Giddey": "SG", "Malik Monk": "SG",
    "Anfernee Simons": "SG", "Jordan Clarkson": "SG", "Gary Trent Jr.": "SG",
    # SF
    "LeBron James": "SF", "Jayson Tatum": "SF", "Kawhi Leonard": "SF",
    "Jimmy Butler": "SF", "Paul George": "SF", "Khris Middleton": "SF",
    "Brandon Ingram": "SF", "OG Anunoby": "SF", "Michael Porter Jr.": "SF",
    "Kevin Durant": "SF", "Franz Wagner": "SF", "Paolo Banchero": "SF",
    "RJ Barrett": "SF", "Scottie Barnes": "SF", "Jalen Williams": "SF",
    "Mikal Bridges": "SF", "Dario Šarić": "SF", "Trey Murphy III": "SF",
    "Trey Murphy": "SF", "Cam Johnson": "SF", "Harrison Barnes": "SF",
    "Andrew Wiggins": "SF", "Aaron Gordon": "SF", "Jabari Smith Jr.": "SF",
    # PF
    "Giannis Antetokounmpo": "PF", "Pascal Siakam": "PF", "Zion Williamson": "PF",
    "Julius Randle": "PF", "Jaren Jackson Jr.": "PF", "John Collins": "PF",
    "Draymond Green": "PF", "Kyle Kuzma": "PF", "Miles Bridges": "PF",
    "Victor Wembanyama": "PF", "Chet Holmgren": "PF", "Jabari Parker": "PF",
    "Nikola Jović": "PF", "Isaiah Jackson": "PF", "Keegan Murray": "PF",
    "Evan Mobley": "PF", "Jeremiah Robinson-Earl": "PF",
    # C
    "Nikola Jokić": "C", "Joel Embiid": "C", "Anthony Davis": "C",
    "Karl-Anthony Towns": "C", "Bam Adebayo": "C", "Rudy Gobert": "C",
    "Domantas Sabonis": "C", "Myles Turner": "C", "Brook Lopez": "C",
    "Alperen Şengün": "C", "Kristaps Porziņģis": "C", "Nikola Vučević": "C",
    "Walker Kessler": "C", "Jonas Valančiūnas": "C", "Daniel Gafford": "C",
    "Jusuf Nurkić": "C", "Robert Williams": "C", "Dereck Lively II": "C",
    "Dereck Lively": "C", "Clint Capela": "C", "Ivica Zubac": "C",
}

# Global dataframes - loaded at module import
df_players = None
player_list = []

def _load_and_process_data():
    """Internal function to load and process data on module import"""
    global df_players, player_list
    
    base_dir = os.path.dirname(os.path.dirname(__file__))
    data_dir = os.path.join(base_dir, "data")
    
    # Load game-by-game data
    game_data_path = os.path.join(data_dir, "database_24_25.csv")
    if not os.path.exists(game_data_path):
        raise FileNotFoundError(f"Game data file not found: {game_data_path}")
    
    df_games = pd.read_csv(game_data_path)
    
    # Convert Data column to datetime
    df_games['Data'] = pd.to_datetime(df_games['Data'], errors='coerce')
    
    # Aggregate per player
    agg_dict = {
        'Tm': 'last',
        'MP': 'mean',
        'FG': 'mean',
        'FGA': 'mean',
        'FG%': 'mean',
        '3P': 'mean',
        '3PA': 'mean',
        '3P%': 'mean',
        'FT': 'mean',
        'FTA': 'mean',
        'FT%': 'mean',
        'ORB': 'mean',
        'DRB': 'mean',
        'TRB': 'mean',
        'AST': 'mean',
        'STL': 'mean',
        'BLK': 'mean',
        'TOV': 'mean',
        'PF': 'mean',
        'PTS': 'mean',
        'GmSc': ['mean', 'std'],
        'Data': 'max'
    }
    
    df_agg = df_games.groupby('Player').agg(agg_dict).reset_index()
    
    # Flatten column names
    df_agg.columns = ['Player', 'Tm', 'MP', 'FG', 'FGA', 'FG%', '3P', '3PA', '3P%', 
                      'FT', 'FTA', 'FT%', 'ORB', 'DRB', 'TRB', 'AST', 'STL', 'BLK', 
                      'TOV', 'PF', 'PTS', 'GmSc_mean', 'GmSc_std', 'LastGame']
    
    # Count games from game log (fallback)
    gp_log = df_games.groupby('Player').size().reset_index(name='GP_log')
    df_agg = df_agg.merge(gp_log, on='Player', how='left')
    df_agg['GP'] = df_agg['GP_log']

    # Calculate last 10 games GmSc
    def get_last10_gmsc(group):
        sorted_group = group.sort_values('Data').tail(10)
        return sorted_group['GmSc'].mean() if len(sorted_group) > 0 else group['GmSc'].mean()
    
    last10 = df_games.groupby('Player').apply(get_last10_gmsc).reset_index(name='GmSc_last10')
    df_agg = df_agg.merge(last10, on='Player', how='left')
    
    # Fill NaN in GmSc_last10 with GmSc_mean
    df_agg['GmSc_last10'] = df_agg['GmSc_last10'].fillna(df_agg['GmSc_mean'])
    df_agg['GmSc_std'] = df_agg['GmSc_std'].fillna(0)
    
    # Load salary data
    salary_path = os.path.join(data_dir, "NBA Player Salaries_2024-25_1.csv")
    if not os.path.exists(salary_path):
        print(f"Warning: Salary file not found: {salary_path}")
        df_salary = pd.DataFrame(columns=['Player', 'Team', 'Salary'])
    else:
        df_salary = pd.read_csv(salary_path)
        
        def parse_salary(sal_str):
            if pd.isna(sal_str):
                return 0.0
            try:
                cleaned = str(sal_str).replace('$', '').replace(',', '').replace(' ', '').strip()
                return float(cleaned) / 1_000_000
            except:
                return 0.0
        
        df_salary['Salary_M'] = df_salary['Salary'].apply(parse_salary)
    
    # Fuzzy salary merge
    def fuzzy_salary_lookup(name, salary_dict):
        match = process.extractOne(name, salary_dict.keys(), score_cutoff=85)
        return salary_dict[match[0]] if match else 0.0

    salary_dict = dict(zip(df_salary['Player'], df_salary['Salary_M']))
    df_agg['Salary_M'] = df_agg['Player'].apply(lambda n: fuzzy_salary_lookup(n, salary_dict))
    df_agg['Salary_M'] = df_agg['Salary_M'].fillna(0.0)
    
    # ── POSITIONS + AGE + OFFICIAL GP ────────────────────────────────
    pos_path = os.path.join(data_dir, "position.csv")
    if os.path.exists(pos_path):
        df_pos = pd.read_csv(pos_path)

        # For traded players (multiple rows), keep the row with most games
        if 'G' in df_pos.columns:
            df_pos = df_pos.sort_values('G', ascending=False).drop_duplicates('Player')
        else:
            df_pos = df_pos.drop_duplicates('Player')

        cols_to_keep = ['Player', 'Pos']
        if 'Age' in df_pos.columns:
            cols_to_keep.append('Age')
        if 'G' in df_pos.columns:
            cols_to_keep.append('G')

        df_pos = df_pos[cols_to_keep]
        df_agg = df_agg.merge(df_pos, on='Player', how='left')

        # Override GP with official season totals from position.csv
        if 'G' in df_agg.columns:
            mask = df_agg['G'].notna() & (df_agg['G'] > 0)
            df_agg.loc[mask, 'GP'] = df_agg.loc[mask, 'G'].astype(int)
            df_agg = df_agg.drop(columns=['G'])
    else:
        df_agg['Pos'] = None
        df_agg['Age'] = 0

    # Clean up helper column
    df_agg = df_agg.drop(columns=['GP_log'], errors='ignore')

    # Ensure Age column exists
    if 'Age' not in df_agg.columns:
        df_agg['Age'] = 0
    df_agg['Age'] = pd.to_numeric(df_agg['Age'], errors='coerce').fillna(0).astype(int)

    # Ensure GP is int
    df_agg['GP'] = pd.to_numeric(df_agg['GP'], errors='coerce').fillna(0).astype(int)
    # ─────────────────────────────────────────────────────────────────

    # Fill position gaps with hardcoded POSITION_MAP
    df_agg['Pos'] = df_agg.apply(
        lambda row: POSITION_MAP.get(row['Player'], row['Pos']), axis=1
    )

    # Final fallback heuristic for anyone still missing a position
    def _infer_pos(row):
        if pd.notna(row['Pos']) and row['Pos'] != 0:
            return row['Pos']
        blk, trb, ast, pts, mp = row['BLK'], row['TRB'], row['AST'], row['PTS'], row['MP']
        if mp < 5:
            return 'SF'
        if blk >= 1.5 and trb >= 7.0:
            return 'C'
        if blk >= 0.7 and trb >= 5.5:
            return 'PF'
        if ast >= 5.5 and trb < 5.5:
            return 'PG'
        if ast >= 3.0 and pts >= 8 and trb < 5.0:
            return 'SG'
        return 'SF'

    df_agg['Pos'] = df_agg.apply(_infer_pos, axis=1)
    
    # Calculate TS%
    denominator = 2 * (df_agg['FGA'] + 0.44 * df_agg['FTA'])
    df_agg['TS_PCT'] = df_agg['PTS'] / denominator.replace(0, 1)
    df_agg['TS_PCT'] = df_agg['TS_PCT'].clip(0, 1).fillna(0)
    
    # Estimate USG% proxy
    df_agg['USG_PCT'] = (df_agg['FGA'] + 0.44 * df_agg['FTA'] + df_agg['TOV']) / (df_agg['MP'] * 0.2 + 1)
    df_agg['USG_PCT'] = df_agg['USG_PCT'].fillna(0)
    
    # Fill all remaining NaN with 0
    df_agg = df_agg.fillna(0)
    
    # Round numeric columns
    numeric_cols = df_agg.select_dtypes(include=[np.number]).columns
    df_agg[numeric_cols] = df_agg[numeric_cols].round(3)
    
    df_players = df_agg
    player_list = sorted(df_players['Player'].unique().tolist())

# Load data on module import
_load_and_process_data()

def get_player(name: str) -> Dict:
    """
    Fuzzy match player name, return row as dict with all NaN replaced by 0.
    Raises ValueError if not found (score < 70).
    """
    if df_players is None:
        raise RuntimeError("Data not loaded")
    
    # Try exact match first
    exact_match = df_players[df_players['Player'].str.lower() == name.lower()]
    if not exact_match.empty:
        player_dict = exact_match.iloc[0].to_dict()
        return {k: (0 if pd.isna(v) else v) for k, v in player_dict.items()}
    
    # Fuzzy match
    player_names = df_players['Player'].unique().tolist()
    match = process.extractOne(name, player_names, score_cutoff=70)
    
    if not match:
        raise ValueError(f"Player not found: {name}")
    
    matched_name = match[0]
    player_row = df_players[df_players['Player'] == matched_name].iloc[0]
    player_dict = player_row.to_dict()
    
    return {k: (0 if pd.isna(v) else v) for k, v in player_dict.items()}