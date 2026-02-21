// Mock player data for development
export const mockPlayer = {
  name: "LeBron James",
  Player: "LeBron James",
  PTS: 25.0,
  TRB: 7.3,
  AST: 6.9,
  STL: 1.3,
  BLK: 0.5,
  "FG%": 0.520,
  "3P%": 0.350,
  "FT%": 0.730,
  PER: 25.8,
  "TS%": 0.610,
  "USG%": 31.2,
  WS: 12.5,
  BPM: 7.2,
  VORP: 5.8,
  salary: 47610000,
  contract_years: 2
}

export const mockAnalysis = {
  z_scores: {
    "PTS": 1.2,
    "TRB": 0.8,
    "AST": 1.5,
    "STL": 0.5,
    "BLK": -0.3,
    "FG%": 0.9,
    "3P%": 0.2,
    "FT%": -0.5,
    "PER": 1.8,
    "TS%": 0.7,
    "USG%": 1.2,
    "WS": 1.5,
    "BPM": 1.3,
    "VORP": 1.6
  },
  impact_score: 1.45,
  percentiles: {
    "PTS": 88,
    "TRB": 75,
    "AST": 92,
    "STL": 65,
    "BLK": 40,
    "FG%": 82,
    "3P%": 55,
    "FT%": 30,
    "PER": 95,
    "TS%": 76,
    "USG%": 88,
    "WS": 92,
    "BPM": 90,
    "VORP": 94
  },
  cv: 0.15,
  trend: "HOT",
  simulation: {
    wins_distribution: Array.from({ length: 1000 }, () => Math.floor(Math.random() * 20) + 45),
    mean_wins: 52.3,
    median_wins: 52,
    std_wins: 4.2,
    min_wins: 42,
    max_wins: 62,
    percentile_25: 49.5,
    percentile_75: 55.2
  },
  valuation: {
    recommendation: "SIGN",
    reasoning: "High impact player with reasonable contract terms",
    annual_value: 50000000,
    total_value: 100000000,
    years: 2,
    impact_score: 1.45,
    current_salary: 47610000
  }
}

export const mockReport = `# Scouting Report: LeBron James

## Player Overview
LeBron James continues to demonstrate elite-level performance despite his age. His combination of scoring, playmaking, and basketball IQ makes him one of the most valuable players in the league.

## Strengths
- Exceptional playmaking ability (92nd percentile in assists)
- High basketball IQ and court vision
- Consistent scoring output (88th percentile)
- Strong rebounding for his position (75th percentile)

## Weaknesses
- Declining free throw percentage (30th percentile)
- Reduced shot-blocking ability
- High usage rate may impact longevity

## Contract Evaluation
The proposed contract of $100M over 2 years ($50M annually) represents fair value for a player of this caliber. Given his impact score of 1.45 and consistent performance, this contract aligns with market expectations.

## Risk Assessment
- Age-related decline risk: Medium
- Injury risk: Low (historically durable)
- Performance sustainability: High

## Final Recommendation
**SIGN** - This contract represents excellent value for a player who continues to perform at an elite level.`
