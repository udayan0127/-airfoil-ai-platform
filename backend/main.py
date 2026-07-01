from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from aerodynamics import analyze_drone
from matcher import recommend_airfoils
from sarvam_integration import generate_airfoil_explanation
from polar_data import generate_polar

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"status": "Airfoil AI Platform running - Sarvam AI integration active"}


@app.post("/recommend-airfoil")
async def recommend_airfoil(weight: float, max_speed: float, payload: float):
    """
    Takes drone specs, runs physics analysis, matches airfoils,
    and generates AI explanations using Sarvam.
    """
    # Step 1: Physics analysis
    physics = analyze_drone(
        weight_g=weight,
        max_speed_kmh=max_speed,
        payload_g=payload
    )

    # Step 2: Match against airfoil database
    top_airfoils = recommend_airfoils(
        reynolds=physics["reynolds_number"],
        required_cl=physics["required_cl"],
        flight_regime=physics["flight_regime"],
        top_n=3
    )

    # Step 3: Generate Sarvam explanations for each airfoil
    airfoils_with_explanations = []
    for af in top_airfoils:
        explanation = generate_airfoil_explanation(af["name"], af, physics)
        airfoils_with_explanations.append({
            "name": af["name"],
            "description": af["description"],
            "match_score": af["match_score"],
            "cl_max": af["cl_max"],
            "cd_min": af["cd_min"],
            "best_cl_cd": af["best_cl_cd"],
            "use_case": af["use_case"],
            "ai_explanation": explanation,  # NEW: Sarvam-generated text
            "polar": generate_polar(af)
        })

    # Step 4: Format response
    return {
        "input": {
            "weight_g": weight,
            "max_speed_kmh": max_speed,
            "payload_g": payload
        },
        "physics": physics,
        "airfoils": airfoils_with_explanations,
        "recommendation": f"Based on your specs, we recommend {top_airfoils[0]['name']} for your build. See the AI explanation below."
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)