"""
Matches drone physics analysis against the airfoil database
to return the top 3 recommended airfoils.
"""

import json
from pathlib import Path

DATA_PATH = Path(__file__).parent / "data" / "airfoils.json"


def load_airfoils() -> list:
    with open(DATA_PATH, "r") as f:
        data = json.load(f)
    return data["airfoils"]


def score_airfoil(airfoil: dict, reynolds: float, required_cl: float, flight_regime: str) -> float:
    """
    Scores an airfoil's suitability (higher = better match).
    Combines three factors:
      1. Reynolds number compatibility (is Re within the airfoil's known range?)
      2. Lift sufficiency (can it produce the required Cl with margin?)
      3. Use-case match (does it fit the flight regime?)
    """
    score = 0.0

    # 1. Reynolds number compatibility (40% weight)
    re_min, re_max = airfoil["re_range"]
    if re_min <= reynolds <= re_max:
        score += 40
    else:
        # Partial credit if close to range boundaries
        distance = min(abs(reynolds - re_min), abs(reynolds - re_max))
        penalty = min(distance / re_max, 1.0) * 40
        score += max(0, 40 - penalty)

    # 2. Lift sufficiency (35% weight)
    # We want cl_max comfortably above required_cl (safety margin ~1.3x)
    if airfoil["cl_max"] >= required_cl * 1.3:
        score += 35
    elif airfoil["cl_max"] >= required_cl:
        score += 20  # meets requirement but with less margin
    else:
        score += 0  # cannot generate enough lift - unsafe

    # 3. Flight regime match (25% weight)
    if airfoil["use_case"] == flight_regime:
        score += 25
    elif airfoil["use_case"] == "general":
        score += 12  # general-purpose airfoils get partial credit for any regime

    return round(score, 2)


def recommend_airfoils(reynolds: float, required_cl: float, flight_regime: str, top_n: int = 3) -> list:
    """
    Returns top N airfoils ranked by suitability score.
    """
    airfoils = load_airfoils()

    scored = []
    for airfoil in airfoils:
        score = score_airfoil(airfoil, reynolds, required_cl, flight_regime)
        scored.append({**airfoil, "match_score": score})

    # Sort by score, descending
    scored.sort(key=lambda x: x["match_score"], reverse=True)

    return scored[:top_n]


# Quick test when running this file directly
if __name__ == "__main__":
    from aerodynamics import analyze_drone

    physics = analyze_drone(weight_g=990, max_speed_kmh=40, payload_g=100)
    print("Physics analysis:", physics)
    print()

    top_airfoils = recommend_airfoils(
        reynolds=physics["reynolds_number"],
        required_cl=physics["required_cl"],
        flight_regime=physics["flight_regime"]
    )

    print("Top 3 recommended airfoils:")
    for i, af in enumerate(top_airfoils, 1):
        print(f"{i}. {af['name']} (score: {af['match_score']}) - {af['description']}")