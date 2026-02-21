export const USE_MOCK = false  // false = real backend

export const mockProfile = {
  player: "Jayson Tatum", team: "BOS", position: "SF", age: "N/A",
  gp: 44, impact_score: 1.8734, percentile: 91.2,
  ts_pct: 60.2, pos_avg_ts: 56.1, cv: 16.3,
  trend_signal: "TRENDING_UP", salary_m: 32.0,
  z_scores: {
    offense: 2.1, defense: 0.8, stability: 1.4,
    pts: 1.9, ast: 0.7, reb: 0.3, stl: 0.5, blk: 0.2, tov: -0.4, ts_pct: 1.1,
  },
  stats: { pts: 26.4, ast: 4.9, reb: 8.1, stl: 1.1, blk: 0.6, tov: 2.3, mp: 35.2, gp: 44, ts_pct: 60.2 },
  radar: { scoring: 88.4, defense: 71.2, playmaking: 79.0, efficiency: 85.3, consistency: 83.7, durability: 82.1 },
}

export const mockSimulation = {
  expected_wins: 45.1, wins_added: 7.1,
  win_range_low: 41, win_range_high: 52, playoff_prob: 81.2,
  win_distribution: Array.from({ length: 10000 }, () => Math.round(38 + Math.random() * 20)),
}

export const mockValuation = {
  fair_value_m: 26.98,
  efficiency_ratio: 0.84,
  overpay_pct: 18.6,
  decision: "NEGOTIATE",
  durability_score: 0.73,
  durability_discount_pct: 27.0,
  health_adjusted_value_m: 19.7,
  risk_label: "MODERATE RISK",
  projected_wins: 13.2,
  is_projected: true,
  absence_reason: "injury",  // Tatum gp=44, mp=35.2 → injury season
}

export const mockReport = {
  verdict: "Tatum is an elite wing delivering top-10 impact at a premium price.",
  strengths: "91st percentile impact score | Hot streak trend over last 10 games",
  concern: "Salary ask exceeds fair value by 18.6%",
  recommendation: "NEGOTIATE — efficiency ratio of 0.84 indicates moderate overpay risk",
  audio_summary: "Jayson Tatum ranks in the 91st percentile league-wide. We recommend negotiating the contract down to fair value.",
}