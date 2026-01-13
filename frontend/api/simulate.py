# api/simulate.py
import os
from fastapi import FastAPI
from pydantic import BaseModel

# import your brain
from brain import BaymaxBrain
from scenario_adapter import load_scenario_payload  # you'll create this

app = FastAPI()

# Load once per warm container (important for speed)
brain = BaymaxBrain(model_file=os.environ.get("MODEL_PATH", "baymax_brain_classifier.pkl"))

class SimulateIn(BaseModel):
    scenario: str = "default_user"
    stress_mod: float | None = None  # optional: let UI pass "stress"

@app.post("/")
def simulate(inp: SimulateIn):
    data = request.json or {}

    stress_mod = float(data.get("stress_mod", 1.0))

    payload = HealthKitAdapter.process_csv_to_payload(filepath)  # or whatever you already do
    payload["demographics"] = data.get("demographics", payload.get("demographics", {}))  # optional but nice

    payload = apply_stress_mod(payload, stress_mod)

    result = brain.get_advice(payload)

    return {
        "status": result["status"],
        "body_battery": result["body_battery"],
        "coach_summary": result.get("coach_summary", ""),
        "vitals": {
            "rhr": result["data"]["resting_heart_rate"],
            "steps": result["data"]["prev_day_steps"],
            "sleep_score": result["data"]["overall_score"],
        },
        "action_plan": result.get("action_plan", {}),
        "insights": result.get("insights", []),
    }
