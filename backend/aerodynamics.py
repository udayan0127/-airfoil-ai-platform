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

# Reference aircraft geometry (builder's RC plane, used as defaults)
# Wingspan: 1.01 m, Chord: 0.195 m, Wing Area: 0.197 m², AR: 5.18
DEFAULT_WINGSPAN = 1.01      # m
DEFAULT_ASPECT_RATIO = 5.18  # dimensionless


def wing_area_from_span(wingspan_m: float, aspect_ratio: float) -> float:
    """
    Wing area derived from wingspan and aspect ratio.
    AR = wingspan² / area  =>  area = wingspan² / AR
    """
    return round((wingspan_m ** 2) / aspect_ratio, 4)


def chord_from_span(wingspan_m: float, aspect_ratio: float) -> float:
    """
    Mean chord derived from wingspan and aspect ratio.
    chord = wingspan / AR (for rectangular wing approximation)
    """
    return round(wingspan_m / aspect_ratio, 4)



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
                  wingspan_m: float = DEFAULT_WINGSPAN,
                  aspect_ratio: float = DEFAULT_ASPECT_RATIO) -> dict:
    """
    Main analysis function. Takes drone specs + wingspan + aspect ratio,
    derives wing area and chord, then computes physics.

    Wingspan and AR come from user input (easy to measure/estimate).
    Wing area and chord are DERIVED from these two, not asked separately.
    """
    total_weight = weight_g + payload_g

    # Derive wing geometry from wingspan and AR
    wing_area_m2 = wing_area_from_span(wingspan_m, aspect_ratio)
    chord_length_m = chord_from_span(wingspan_m, aspect_ratio)

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
        "estimated_chord_m": chord_length_m,
        "wingspan_m": wingspan_m,
        "aspect_ratio": aspect_ratio
    }
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
    print("=== Reference RC plane (1.01m span, AR 5.18) ===")
    result = analyze_drone(weight_g=990, max_speed_kmh=40, payload_g=100)
    print(result)
    print()
    print("=== Kamikaze drone (0.6m span, AR 3.0) ===")
    result2 = analyze_drone(weight_g=500, max_speed_kmh=80, payload_g=200,
                            wingspan_m=0.6, aspect_ratio=3.0)
    print(result2)