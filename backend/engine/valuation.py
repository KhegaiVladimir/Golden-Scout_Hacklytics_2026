import pandas as pd
from typing import Dict
from engine.stats import calculate_impact_score

def calculate_value(
    player: Dict,
    stats_df: pd.DataFrame,
    contract_value: float,
    contract_years: int
) -> Dict:
    """Calculate contract valuation and recommendation"""
    
    # Calculate player's market value based on stats
    # Simplified model using impact score and comparable players
    
    # Get player's salary if available
    current_salary = player.get("salary", 0)
    
    # Calculate annual contract value
    annual_value = contract_value / contract_years if contract_years > 0 else contract_value
    
    # Determine recommendation
    impact_score = calculate_impact_score(player, stats_df)
    
    # Get comparable players (similar stats)
    # Simplified: use impact score to determine if contract is fair
    
    # Valuation logic:
    # - High impact + reasonable contract = SIGN
    # - Medium impact + high contract = NEGOTIATE
    # - Low impact + high contract = AVOID
    
    if impact_score > 1.0:
        # High impact player
        if annual_value <= current_salary * 1.2:  # Within 20% of current
            recommendation = "SIGN"
            reasoning = "High impact player with reasonable contract terms"
        else:
            recommendation = "NEGOTIATE"
            reasoning = "High impact player but contract may be slightly high"
    elif impact_score > 0.0:
        # Medium impact player
        if annual_value <= current_salary * 1.1:
            recommendation = "SIGN"
            reasoning = "Solid player with fair contract"
        else:
            recommendation = "NEGOTIATE"
            reasoning = "Consider negotiating contract terms"
    else:
        # Low impact player
        if annual_value > current_salary * 0.9:
            recommendation = "AVOID"
            reasoning = "Low impact player with high contract value"
        else:
            recommendation = "NEGOTIATE"
            reasoning = "Low impact player, contract may still be negotiable"
    
    return {
        "recommendation": recommendation,
        "reasoning": reasoning,
        "annual_value": annual_value,
        "total_value": contract_value,
        "years": contract_years,
        "impact_score": impact_score,
        "current_salary": current_salary
    }
