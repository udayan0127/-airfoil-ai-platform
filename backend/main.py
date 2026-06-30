from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from pathlib import Path

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple health check
@app.get("/")
def read_root():
    return {"status": "Airfoil AI Platform running ✅"}

# Main endpoint
@app.post("/recommend-airfoil")
async def recommend_airfoil(weight: float, max_speed: float, payload: float):
    """
    Takes drone specs and returns airfoil recommendations
    """
    # For now, return hardcoded data
    # Tomorrow we'll integrate real XFOIL + Sarvam
    return {
        "weight_g": weight,
        "max_speed_kmh": max_speed,
        "payload_g": payload,
        "airfoils": [
            {"name": "NACA 2412", "description": "Good all-rounder, excellent for your RC plane weight"},
            {"name": "NACA 4412", "description": "Higher lift, great for heavier payloads"}
        ],
        "recommendation": "Testing mode - real recommendations coming soon!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)