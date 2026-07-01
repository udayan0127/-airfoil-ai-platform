"""
Aerodynamics calculator - converts drone specs into physics parameters
that we can match against the airfoil database.
"""

import math

# Air properties at sea level, standard conditions
AIR_DENSITY = 1.225  # kg/m^3
AIR_VISCOSITY = 1.789e-5  # kg/(m*s)
GRAVITY = 9.81  # m/s^2


def calculate_reynolds_number(speed_kmh: float, chord_length_m: float = 0.15) -> float:
    """
    Reynolds number = (density * velocity * chord_length) / viscosity
    
    chord_length_m defaults to 0.15m (15cm) - typical small RC/drone wing chord.
    This matches roughly with your RC plane's 19.5cm chord for reference.
    """
    speed_ms = speed_kmh / 3.6  # convert km/h to m/s
    re = (AIR_DENSITY * speed_ms * chord_length_m) / AIR_VISCOSITY
    return round(re, 0)


def calculate_required_cl(weight_g: float, speed_kmh: float, wing_area_m2: float = 0.05) -> float:
    """
    Required lift coefficient to sustain level flight.
    
    Lift = weight (in level flight)
    L = 0.5 * density * V^2 * S * Cl
    => Cl = (2 * weight) / (density * V^2 * S)
    
    wing_area_m2 defaults to 0.05 m^2 - typical small drone/RC plane wing area.
    """
    weight_kg = weight_g / 1000
    weight_n = weight_kg * GRAVITY  # convert to Newtons
    speed_ms = speed_kmh / 3.6

    if speed_ms == 0:
        return 0

    cl_required = (2 * weight_n) / (AIR_DENSITY * (speed_ms ** 2) * wing_area_m2)
    return round(cl_required, 3)


def calculate_wing_loading(weight_g: float, wing_area_m2: float = 0.05) -> float:
    """
    Wing loading = weight / wing area (N/m^2)
    Lower wing loading = slower stall speed, more maneuverable
    Higher wing loading = faster flight, less maneuverable, better for payload
    """
    weight_kg = weight_g / 1000
    weight_n = weight_kg * GRAVITY
    return round(weight_n / wing_area_m2, 2)


def determine_flight_regime(speed_kmh: float, payload_g: float, weight_g: float) -> str:
    """
    Categorize the flight regime based on specs, to help match use_case
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


def estimate_wing_area(total_weight_g: float) -> float:
    """
    Estimate a realistic wing area based on total weight, using
    typical RC aircraft wing loading (30-70 N/m^2 for trainers/general RC planes).
    
    Reference: Your own RC plane is 990g with 0.197 m^2 wing area,
    giving a wing loading of ~49 N/m^2 - we use this as our target baseline.
    """
    total_weight_kg = total_weight_g / 1000
    weight_n = total_weight_kg * GRAVITY
    target_wing_loading = 50  # N/m^2, reasonable baseline for RC aircraft (matches your plane)
    wing_area_m2 = weight_n / target_wing_loading
    return round(wing_area_m2, 4)


def estimate_chord_length(wing_area_m2: float, aspect_ratio: float = 5.2) -> float:
    """
    Estimate chord length from wing area, assuming a typical aspect ratio.
    Your RC plane has AR = 5.18, so we default close to that.
    
    Aspect Ratio = wingspan^2 / wing_area
    Approx chord = wing_area / wingspan, and wingspan = sqrt(AR * wing_area)
    """
    wingspan = math.sqrt(aspect_ratio * wing_area_m2)
    chord = wing_area_m2 / wingspan
    return round(chord, 4)


def analyze_drone(weight_g: float, max_speed_kmh: float, payload_g: float,
                   wing_area_m2: float = None, chord_length_m: float = None) -> dict:
    """
    Main function: takes drone specs, returns full physics analysis.
    
    If wing_area_m2 or chord_length_m are not provided, we estimate them
    from the total weight using realistic RC aircraft wing loading ratios.
    """
    total_weight = weight_g + payload_g

    # Auto-estimate wing area if not provided
    if wing_area_m2 is None:
        wing_area_m2 = estimate_wing_area(total_weight)

    # Auto-estimate chord length if not provided
    if chord_length_m is None:
        chord_length_m = estimate_chord_length(wing_area_m2)

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

# Quick test when running this file directly
if __name__ == "__main__":
    result = analyze_drone(weight_g=990, max_speed_kmh=40, payload_g=100)
    print(result)