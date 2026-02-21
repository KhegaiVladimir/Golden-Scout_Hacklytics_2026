"""
Pure functions. Take data in, return data out. No I/O.
"""
import pandas as pd
import numpy as np
from scipy.stats import percentileofscore
from typing import Dict, List

def compute_position_stats(df: pd.DataFrame) -> Dict:
    """
    Group df_players by Pos.
    For each position compute mean + std for: PTS, AST, TRB, STL, BLK, TOV, TS_PCT, USG_PCT, MP, GP
    """
    stats_to_compute = ['PTS', 'AST', 'TRB', 'STL', 'BLK', 'TOV', 'TS_PCT', 'USG_PCT', 'MP', 'GP']
    pos_stats = {}
    
    for pos in df['Pos'].unique():
        pos_df = df[df['Pos'] == pos]
        pos_stats[pos] = {}
        
        for stat in stats_to_compute:
            if stat in pos_df.columns:
                mean_val = pos_df[stat].mean()
                std_val = pos_df[stat].std()
                pos_stats[pos][stat] = {
                    'mean': float(mean_val) if not pd.isna(mean_val) else 0.0,
                    'std': float(std_val) if not pd.isna(std_val) else 0.0
                }
            else:
                pos_stats[pos][stat] = {'mean': 0.0, 'std': 0.0}
    
    return pos_stats

def z_score(value: float, mean: float, std: float) -> float:
    """
    (value - mean) / std
    If std == 0: return 0.0
    Clip to [-3.0, 3.0]
    Round to 3 decimal places
    """
    if std == 0:
        return 0.0
    z = (value - mean) / std
    z = np.clip(z, -3.0, 3.0)
    return round(float(z), 3)

MIN_GAMES = 15
MIN_MPG   = 10.0

def compute_impact_score(player: Dict, pos_stats: Dict) -> float:
    """
    Compute impact score = 35% positional z-score + 65% absolute production.

    For small-sample players (< MIN_GAMES or < MIN_MPG) we fall back to
    positional z only, because per-game averages from 2 games are unreliable
    (e.g., 100% TS%).
    """
    pos = player.get('Pos', 'SF')
    if pos not in pos_stats:
        pos = 'SF'

    ps = pos_stats[pos]

    # ── position-adjusted z-scores ──────────────────────────────────────────
    z_pts = z_score(player.get('PTS', 0), ps['PTS']['mean'], ps['PTS']['std'])
    z_ast = z_score(player.get('AST', 0), ps['AST']['mean'], ps['AST']['std'])
    z_trb = z_score(player.get('TRB', 0), ps['TRB']['mean'], ps['TRB']['std'])
    z_stl = z_score(player.get('STL', 0), ps['STL']['mean'], ps['STL']['std'])
    z_blk = z_score(player.get('BLK', 0), ps['BLK']['mean'], ps['BLK']['std'])
    z_tov = z_score(player.get('TOV', 0), ps['TOV']['mean'], ps['TOV']['std'])
    z_ts  = z_score(player.get('TS_PCT', 0), ps['TS_PCT']['mean'], ps['TS_PCT']['std'])
    z_usg = z_score(player.get('USG_PCT', 0), ps['USG_PCT']['mean'], ps['USG_PCT']['std'])
    z_mp  = z_score(player.get('MP', 0), ps['MP']['mean'], ps['MP']['std'])
    z_gp  = z_score(player.get('GP', 0), ps['GP']['mean'], ps['GP']['std'])

    offense   = 0.5 * z_ts + 0.3 * z_usg + 0.2 * z_ast
    defense   = 0.4 * z_stl + 0.4 * z_blk - 0.2 * z_tov
    stability = 0.6 * z_mp + 0.4 * z_gp
    age       = player.get('Age', 27)
    age_factor = max(0.0, 1.0 - abs(age - 27) / 10)

    positional_z = (
        0.35 * offense +
        0.25 * defense +
        0.20 * stability +
        0.10 * age_factor +
        0.10 * z_ts
    )

    # ── small-sample guard ───────────────────────────────────────────────────
    # Absolute stats from 2 games are artifacts (e.g. 100% TS).
    # Return positional z only; simulation.py will apply its own discount.
    gp  = player.get('GP', 0)
    mpg = player.get('MP', 0)
    if gp < MIN_GAMES or mpg < MIN_MPG:
        return round(float(positional_z), 4)

    # ── absolute production component ────────────────────────────────────────
    # Cap TS% at 0.70 to prevent large-sample outliers from dominating.
    ts_abs = min(player.get('TS_PCT', 0), 0.70)
    absolute_component = (
        player.get('PTS', 0) * 0.03 +
        player.get('AST', 0) * 0.05 +
        player.get('TRB', 0) * 0.02 +
        (player.get('STL', 0) + player.get('BLK', 0)) * 0.06 +
        (ts_abs - 0.55) * 2.0 -
        player.get('TOV', 0) * 0.04
    )

    # 35% positional context + 65% raw production
    impact = 0.35 * positional_z + 0.65 * absolute_component
    return round(float(impact), 4)

def compute_percentile(score: float, all_scores: List[float]) -> float:
    """
    Compute percentile using scipy.stats.percentileofscore
    """
    if not all_scores:
        return 0.0
    return round(percentileofscore(all_scores, score, kind='rank'), 1)

def compute_cv(player: Dict) -> float:
    """
    CV = (GmSc_std / GmSc_mean) * 100
    If GmSc_mean == 0: return 0.0
    Round to 1 decimal place
    """
    gmsc_mean = player.get('GmSc_mean', 0)
    gmsc_std = player.get('GmSc_std', 0)
    
    if gmsc_mean == 0:
        return 0.0
    
    cv = (gmsc_std / gmsc_mean) * 100
    return round(float(cv), 1)

def compute_trend(player: Dict) -> str:
    """
    signal = (GmSc_last10 - GmSc_mean) / (GmSc_std + 0.001)
    If signal > 0.75:  return "TRENDING_UP"
    If signal < -0.75: return "TRENDING_DOWN"
    Else:              return "STEADY"
    """
    gmsc_last10 = player.get('GmSc_last10', 0)
    gmsc_mean = player.get('GmSc_mean', 0)
    gmsc_std = player.get('GmSc_std', 0)
    
    signal = (gmsc_last10 - gmsc_mean) / (gmsc_std + 0.001)
    
    if signal > 0.75:
        return "TRENDING_UP"
    elif signal < -0.75:
        return "TRENDING_DOWN"
    else:
        return "STEADY"

def build_radar_data(player: Dict, pos_stats: Dict) -> Dict:
    """
    Normalize each dimension to 0–100 using percentile within all players.
    """
    from engine.loader import df_players
    
    if df_players is None:
        return {
            "scoring": 50.0,
            "defense": 50.0,
            "playmaking": 50.0,
            "efficiency": 50.0,
            "consistency": 50.0,
            "durability": 50.0
        }
    
    pos = player.get('Pos', 'SF')
    if pos not in pos_stats:
        pos = 'SF'
    
    stats = pos_stats[pos]
    
    # Get z-scores
    z_pts = z_score(player.get('PTS', 0), stats['PTS']['mean'], stats['PTS']['std'])
    z_ast = z_score(player.get('AST', 0), stats['AST']['mean'], stats['AST']['std'])
    z_stl = z_score(player.get('STL', 0), stats['STL']['mean'], stats['STL']['std'])
    z_blk = z_score(player.get('BLK', 0), stats['BLK']['mean'], stats['BLK']['std'])
    z_ts = z_score(player.get('TS_PCT', 0), stats['TS_PCT']['mean'], stats['TS_PCT']['std'])
    z_gp = z_score(player.get('GP', 0), stats['GP']['mean'], stats['GP']['std'])
    
    # Compute CV
    cv = compute_cv(player)
    
    # Build radar data (clamp to 0-100)
    scoring = np.clip(50 + z_pts * 15, 0, 100)
    defense = np.clip(50 + ((z_stl + z_blk) / 2) * 15, 0, 100)
    playmaking = np.clip(50 + z_ast * 15, 0, 100)
    efficiency = np.clip(50 + z_ts * 15, 0, 100)
    consistency = np.clip(100 - cv, 0, 100)  # Inverted: low CV = high consistency
    durability = np.clip(50 + z_gp * 15, 0, 100)
    
    return {
        "scoring": round(float(scoring), 1),
        "defense": round(float(defense), 1),
        "playmaking": round(float(playmaking), 1),
        "efficiency": round(float(efficiency), 1),
        "consistency": round(float(consistency), 1),
        "durability": round(float(durability), 1)
    }

def build_full_profile(player_name: str) -> Dict:
    """
    Build complete player profile with all computed metrics.
    """
    from engine.loader import df_players, get_player

    player = get_player(player_name)
    pos_stats = compute_position_stats(df_players)

    # Compute all impact scores for percentile calculation
    all_impact_scores = []
    for _, row in df_players.iterrows():
        row_dict = row.to_dict()
        impact = compute_impact_score(row_dict, pos_stats)
        all_impact_scores.append(impact)

    impact_score = compute_impact_score(player, pos_stats)
    percentile = compute_percentile(impact_score, all_impact_scores)

    # Get z-scores for detailed breakdown
    pos = player.get('Pos', 'SF')
    if pos not in pos_stats:
        pos = 'SF'
    stats = pos_stats[pos]

    z_pts = z_score(player.get('PTS', 0), stats['PTS']['mean'], stats['PTS']['std'])
    z_ast = z_score(player.get('AST', 0), stats['AST']['mean'], stats['AST']['std'])
    z_trb = z_score(player.get('TRB', 0), stats['TRB']['mean'], stats['TRB']['std'])
    z_stl = z_score(player.get('STL', 0), stats['STL']['mean'], stats['STL']['std'])
    z_blk = z_score(player.get('BLK', 0), stats['BLK']['mean'], stats['BLK']['std'])
    z_tov = z_score(player.get('TOV', 0), stats['TOV']['mean'], stats['TOV']['std'])
    z_ts = z_score(player.get('TS_PCT', 0), stats['TS_PCT']['mean'], stats['TS_PCT']['std'])
    z_usg = z_score(player.get('USG_PCT', 0), stats['USG_PCT']['mean'], stats['USG_PCT']['std'])
    z_mp = z_score(player.get('MP', 0), stats['MP']['mean'], stats['MP']['std'])
    z_gp = z_score(player.get('GP', 0), stats['GP']['mean'], stats['GP']['std'])

    offense_z = 0.5 * z_ts + 0.3 * z_usg + 0.2 * z_ast
    defense_z = 0.4 * z_stl + 0.4 * z_blk - 0.2 * z_tov
    stability_z = 0.6 * z_mp + 0.4 * z_gp

    # Small sample detection
    gp = int(player.get('GP', 0))
    mpg = float(player.get('MP', 0))
    small_sample = gp < MIN_GAMES or mpg < MIN_MPG
    warnings = []
    if small_sample:
        warnings.append(f"Small sample: {gp} games, {mpg:.1f} MPG — stats unreliable")

    return {
        "player": player.get('Player', player_name),
        "team": player.get('Tm', 'N/A'),
        "position": player.get('Pos', 'SF'),
        "age": player.get('Age', 'N/A'),
        "gp": gp,
        "impact_score": impact_score,
        "percentile": percentile,
        "ts_pct": round(player.get('TS_PCT', 0) * 100, 1),
        "pos_avg_ts": round(stats['TS_PCT']['mean'] * 100, 1),
        "pos_avg_pts": round(stats['PTS']['mean'], 1),
        "pos_avg_ast": round(stats['AST']['mean'], 1),
        "pos_avg_reb": round(stats['TRB']['mean'], 1),
        "pos_avg_stl_blk": round(stats['STL']['mean'] + stats['BLK']['mean'], 1),
        "pos_avg_tov": round(stats['TOV']['mean'], 1),
        "cv": compute_cv(player),
        "trend_signal": compute_trend(player),
        "salary_m": round(player.get('Salary_M', 0), 2),
        "small_sample": small_sample,
        "warnings": warnings,
        "z_scores": {
            "offense": round(offense_z, 3),
            "defense": round(defense_z, 3),
            "stability": round(stability_z, 3),
            "pts": z_pts,
            "ast": z_ast,
            "reb": z_trb,
            "stl": z_stl,
            "blk": z_blk,
            "tov": z_tov,
            "ts_pct": z_ts,
        },
        "stats": {
            "pts": round(player.get('PTS', 0), 1),
            "ast": round(player.get('AST', 0), 1),
            "reb": round(player.get('TRB', 0), 1),
            "stl": round(player.get('STL', 0), 1),
            "blk": round(player.get('BLK', 0), 1),
            "tov": round(player.get('TOV', 0), 1),
            "mp": round(player.get('MP', 0), 1),
            "gp": gp,
            "ts_pct": round(player.get('TS_PCT', 0) * 100, 1),
        },
        "radar": build_radar_data(player, pos_stats),
    }
