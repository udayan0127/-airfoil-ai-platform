"""
Aerodynamics calculator - converts drone specs into physics parameters
that we can match against the airfoil database.

Uses wing geometry provided by the user (defaults to reference RC plane).
"""

import math

# Air properties at sea level, standard conditions
AIR_DENSITY = 1.225  # kg/m^3
AIR_VISCOSITY = 1.789e-5  # kg/(m*s)
GRAVITY = 9.81  # m/s^2

# Reference aircraft geometry (builder's RC plane, used as default)
# Wingspan: 1.01 m, Chord: 0.195 m, Wing Area: 0.197 m², AR: 5.18
DEFAULT_WING_AREA = 0.197   # m²
DEFAULT_CHORD = 0.195       # m


def calculate_reynolds_number(speed_kmh: float, chord_length_m: float) -> float:
    """
    Reynolds number = (density * velocity * chord_length) / viscosity
    """
    speed_ms = speed_kmh / 3.6  # km/h to m/s
    re = (AIR_DENSITY * speed_ms * chord_length_m) / AIR_VISCOSITY
    return round(re, 0)


def calculate_required_cl(weight_g: float, speed_kmh: float, wing_area_m2: float) -> float:
    """
    Required lift coefficient to sustain level flight.
    L = weight => Cl = (2 * W) / (rho * V^2 * S)
    """
    weight_kg = weight_g / 1000
    weight_n = weight_kg * GRAVITY
    speed_ms = speed_kmh / 3.6

    if speed_ms == 0:
        return 0

    cl_required = (2 * weight_n) / (AIR_DENSITY * (speed_ms ** 2) * wing_area_m2)
    return round(cl_required, 3)


def calculate_wing_loading(weight_g: float, wing_area_m2: float) -> float:
    """
    Wing loading = weight / wing area (N/m²)
    Lower = slow, maneuverable; Higher = fast, payload-capable
    """
    weight_kg = weight_g / 1000
    weight_n = weight_kg * GRAVITY
    return round(weight_n / wing_area_m2, 2)


def determine_flight_regime(speed_kmh: float, payload_g: float, weight_g: float) -> str:
    """
    Categorize flight regime based on specs, to match against airfoil use_case
    """
    payload_ratio = payload_g / weight_g if weight_g > 0 else 0

    if speed_kmh > 60:
        return "racing"
    elif payload_ratio > 0.3:
        return "heavy_lift"
    elif speed_kmh < 25:
        return "glider"
    else:
        return "general"


def analyze_drone(weight_g: float, max_speed_kmh: float, payload_g: float,
                  wing_area_m2: float = DEFAULT_WING_AREA,
                  chord_length_m: float = DEFAULT_CHORD) -> dict:
    """
    Main analysis function. Takes drone specs + wing geometry, returns full physics analysis.

    Wing geometry comes from user input (or defaults to reference RC plane).
    Weight changes → required Cl and wing loading change.
    Speed changes → Reynolds number changes.
    Wing geometry does NOT change unless caller provides new values.
    """
    total_weight = weight_g + payload_g

    reynolds = calculate_reynolds_number(max_speed_kmh, chord_length_m)
    required_cl = calculate_required_cl(total_weight, max_speed_kmh, wing_area_m2)
    wing_loading = calculate_wing_loading(total_weight, wing_area_m2)
    flight_regime = determine_flight_regime(max_speed_kmh, payload_g, weight_g)

    return {
        "reynolds_number": reynolds,
        "required_cl": required_cl,
        "wing_loading_n_m2": wing_loading,
        "flight_regime": flight_regime,
        "total_weight_g": total_weight,
        "estimated_wing_area_m2": wing_area_m2,
        "estimated_chord_m": chord_length_m
    }


# Quick test
if __name__ == "__main__":
    print("=== Reference RC plane ===")
    result = analyze_drone(weight_g=990, max_speed_kmh=40, payload_g=100)
    print(result)
    print()
    print("=== Custom drone (heavy cargo) ===")
    result2 = analyze_drone(weight_g=5000, max_speed_kmh=40, payload_g=1000,
                            wing_area_m2=0.8, chord_length_m=0.35)
    print(result2)