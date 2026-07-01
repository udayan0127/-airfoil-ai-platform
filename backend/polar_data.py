"""
Generates drag polar data (Cl vs Cd curves) for each airfoil.

Real XFOIL data would be ideal, but for our MVP we generate physically
plausible curves using a quadratic drag polar approximation:
    Cd = Cd_min + K * (Cl - Cl_ldmax)^2

where Cl_ldmax is the Cl at best L/D ratio, and K is a curvature factor.
"""

import math


def generate_polar(airfoil: dict, num_points: int = 40) -> dict:
    """
    Given an airfoil dict with cl_max, cd_min, best_cl_cd,
    generate a drag polar curve.
    """
    cl_max = airfoil["cl_max"]
    cd_min = airfoil["cd_min"]
    ld_max = airfoil["best_cl_cd"]

    # Cl at which drag is minimum (near L/D max point)
    cl_ldmax = cd_min * ld_max  # from L/D = Cl/Cd => Cl = LD * Cd

    # Curvature factor - controls how fast drag rises off min
    # Fit so that at cl_max, Cd is roughly 2x cd_min (realistic for many airfoils)
    delta = cl_max - cl_ldmax
    if delta <= 0:
        K = 0.01  # fallback
    else:
        K = (cd_min * 1.5) / (delta * delta)

    # Generate points across Cl range
    cl_min = -0.4  # negative lift (inverted flight)
    curve = []

    for i in range(num_points):
        cl = cl_min + (cl_max - cl_min) * (i / (num_points - 1))
        # Quadratic polar: Cd rises as Cl departs from cl_ldmax
        cd = cd_min + K * (cl - cl_ldmax) ** 2

        # Add stall behavior - Cd rises sharply near cl_max
        if cl > cl_max * 0.9:
            stall_factor = ((cl - cl_max * 0.9) / (cl_max * 0.1)) ** 2
            cd += stall_factor * cd_min * 3

        # L/D at this point
        ld = cl / cd if cd > 0 else 0

        curve.append({
            "cl": round(cl, 4),
            "cd": round(cd, 6),
            "ld": round(ld, 2)
        })

    return {
        "name": airfoil["name"],
        "curve": curve,
        "cl_ldmax": round(cl_ldmax, 3),
        "operating_point": {
            "cl": cl_ldmax,
            "cd": cd_min
        }
    }


if __name__ == "__main__":
    # Test
    test_airfoil = {
        "name": "NACA 2412",
        "cl_max": 1.4,
        "cd_min": 0.0075,
        "best_cl_cd": 65
    }
    polar = generate_polar(test_airfoil)
    print(f"Generated {len(polar['curve'])} points")
    print(f"First 3: {polar['curve'][:3]}")
    print(f"Last 3: {polar['curve'][-3:]}")
    print(f"Cl at L/D max: {polar['cl_ldmax']}")