"""
Generates polar curves at multiple Reynolds numbers for the same airfoil.

Uses a physics-based approximation: as Reynolds number increases,
- Cd decreases (less viscous drag)
- Cl_max increases (delayed stall)
- L/D improves

This lets us animate how an airfoil's performance changes with scale/speed.
"""

import math
from polar_data import generate_polar


def apply_reynolds_correction(airfoil: dict, target_re: float, reference_re: float = 200000) -> dict:
    """
    Return a modified airfoil dict with cd_min, cl_max, best_cl_cd adjusted
    for the target Reynolds number.
    
    Uses simplified scaling:
    - Cd scales as (Re_ref / Re_target)^0.2  (turbulent skin friction)
    - Cl_max increases up to +20% from Re 50k → 500k
    - L/D scales with Cd inversely
    """
    ratio = reference_re / target_re
    
    # Drag correction (higher Re = less drag)
    cd_factor = ratio ** 0.2
    new_cd_min = round(airfoil["cd_min"] * cd_factor, 5)
    
    # Cl_max correction (higher Re = higher stall angle = higher Cl_max)
    # Cap at ±15% from reference
    cl_factor = 1 + 0.15 * math.log10(target_re / reference_re)
    cl_factor = max(0.85, min(1.15, cl_factor))
    new_cl_max = round(airfoil["cl_max"] * cl_factor, 3)
    
    # L/D correction (inversely with drag)
    new_ld = round(airfoil["best_cl_cd"] / cd_factor, 1)
    
    return {
        "name": airfoil["name"],
        "cl_max": new_cl_max,
        "cd_min": new_cd_min,
        "best_cl_cd": new_ld
    }


def generate_reynolds_sweep(airfoil: dict, re_values: list = None) -> dict:
    """
    Generate polar curves for the same airfoil at multiple Reynolds numbers.
    
    Returns a dict with the airfoil name and a list of curves indexed by Re.
    """
    if re_values is None:
        # Default: 8 Reynolds values from 50k to 500k
        re_values = [50000, 80000, 120000, 180000, 250000, 350000, 450000, 500000]
    
    sweep_data = []
    for re in re_values:
        # Apply Reynolds correction to airfoil params
        adjusted_airfoil = apply_reynolds_correction(airfoil, re)
        # Generate polar curve for this modified airfoil
        polar = generate_polar(adjusted_airfoil)
        sweep_data.append({
            "reynolds": re,
            "curve": polar["curve"],
            "cl_max": adjusted_airfoil["cl_max"],
            "cd_min": adjusted_airfoil["cd_min"],
            "best_ld": adjusted_airfoil["best_cl_cd"]
        })
    
    return {
        "name": airfoil["name"],
        "sweep": sweep_data
    }


if __name__ == "__main__":
    # Test with NACA 2412
    test_airfoil = {
        "name": "NACA 2412",
        "cl_max": 1.4,
        "cd_min": 0.0075,
        "best_cl_cd": 65
    }
    result = generate_reynolds_sweep(test_airfoil)
    print(f"Generated {len(result['sweep'])} Reynolds sweep points")
    for point in result["sweep"]:
        print(f"  Re={point['reynolds']:>7} → Cl_max={point['cl_max']:.2f}, "
              f"Cd_min={point['cd_min']:.5f}, L/D={point['best_ld']}")