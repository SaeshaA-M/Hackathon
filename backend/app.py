# app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from brain import BaymaxBrain, HealthKitAdapter
from simulator import generate_payload, payload_to_trends, generate_calendar, scenario_defaults
from coach_templates import generate_coach
from datetime import datetime


def apply_stress_mod(payload: dict, stress_mod: float) -> dict:
    """
    Applies stress_mod ONLY to today's biometrics.
    stress_mod:
      1.0 = normal
      >1.0 = more stressed (less sleep, higher RHR, fewer steps)
      <1.0 = calmer (more sleep, lower RHR, more steps)
    """
    m = float(max(0.7, min(1.3, stress_mod)))
    bio = payload.get("biometrics", {}) or {}

    # crude but effective
    baseline_steps = float(bio.get("HKQuantityTypeIdentifierStepCount", 5000))
    fitness_factor = min(1.0, baseline_steps / 12000.0)  # athlete ≈ 1.0, sedentary ≈ 0.25

    m = float(max(0.7, min(1.3, stress_mod)))
    x = (m - 1.0) * 2.5   # <— simple sensitivity knob (try 2.0–4.0)

    sleep_mult = 1.0 - 1.1 * x      # bigger hit/boost
    rhr_mult   = 1.0 + 0.9 * x
    step_mult  = 1.0 - 1.6 * x


    # --- Sleep (either "total" minutes OR stage minutes) ---
    if isinstance(bio.get("sleep"), dict):
        sleep_obj = bio["sleep"]
        if "total" in sleep_obj:
            sleep_obj["total"] = float(sleep_obj["total"]) * sleep_mult
        else:
            for k in (
                "HKCategoryValueSleepAnalysisAsleepCore",
                "HKCategoryValueSleepAnalysisAsleepDeep",
                "HKCategoryValueSleepAnalysisAsleepREM",
            ):
                if k in sleep_obj:
                    sleep_obj[k] = int(float(sleep_obj[k]) * sleep_mult)

    # --- RHR ---
    if "HKQuantityTypeIdentifierRestingHeartRate" in bio:
        bio["HKQuantityTypeIdentifierRestingHeartRate"] = float(bio["HKQuantityTypeIdentifierRestingHeartRate"]) * rhr_mult

    # --- Steps ---
    if "HKQuantityTypeIdentifierStepCount" in bio:
        bio["HKQuantityTypeIdentifierStepCount"] = float(bio["HKQuantityTypeIdentifierStepCount"]) * step_mult

    # --- Recompute load in a consistent way ---
    rhr = float(bio.get("HKQuantityTypeIdentifierRestingHeartRate", 60))
    steps = float(bio.get("HKQuantityTypeIdentifierStepCount", 0))
    active_min = float(bio.get("HKQuantityTypeIdentifierAppleExerciseTime", steps * 0.01))
    bio["HKQuantityTypeIdentifierAppleExerciseTime"] = active_min
    bio["training_load_score"] = float(active_min * (rhr / 60.0) * 1.5)

    payload["biometrics"] = bio
    return payload


app = Flask(__name__)
CORS(app)

brain = BaymaxBrain(model_file=os.environ.get("MODEL_PATH", "./baymax_brain_classifier.pkl"))

SCENARIO_DIR = os.environ.get("SCENARIO_DIR", "./scenarios")

@app.route("/api/simulate", methods=["POST"])
def simulate():
    print("simulate payload:", request.json)

    data = request.json or {}

    scenario = data.get("scenario", "average")          # "athlete" | "average" | "recovery"
    days = int(data.get("days", 14))
    stress_mod = float(data.get("stress_mod", 1.0))
    seed = int(data.get("seed", 7))

    demographics = data.get("demographics") or {"Age": 28, "Gender": 1, "part_of_day_code": 0}

    # Prefer CSV if present (preloaded), else generate on the fly
    csv_path = os.path.join(SCENARIO_DIR, f"{scenario}.csv")
    if os.path.exists(csv_path):
        payload = HealthKitAdapter.process_csv_to_payload(csv_path, demographics=demographics)
    else:
        payload = generate_payload(
            scenario=scenario,
            days=days,
            stress_mod=stress_mod,
            seed=seed,
            demographics=demographics
        )
    payload = apply_stress_mod(payload, stress_mod)

    result = brain.get_advice(payload)

    # Build trend series for UI charts
    trends = payload_to_trends(payload)

    # Calendar
        # Calendar (activity log)
    base, var = scenario_defaults(scenario)
    calendar = generate_calendar(base=base, variance=var, days_back=90, seed=seed + 100)



    # Make UI vitals shape
    today = payload["biometrics"]
    sleep = today.get("sleep", {}) or {}
    sleep_mins = float(
        sleep.get("HKCategoryValueSleepAnalysisAsleepCore", 0)
        + sleep.get("HKCategoryValueSleepAnalysisAsleepDeep", 0)
        + sleep.get("HKCategoryValueSleepAnalysisAsleepREM", 0)
    )
    core_mins = float(sleep.get("HKCategoryValueSleepAnalysisAsleepCore", 0))
    deep_mins = float(sleep.get("HKCategoryValueSleepAnalysisAsleepDeep", 0))
    rem_mins  = float(sleep.get("HKCategoryValueSleepAnalysisAsleepREM", 0))

    sleep_hours = round(sleep_mins / 60.0, 1)

    vitals = {
        "heartRate": int(result["data"]["resting_heart_rate"]),
        "hrv": int(40 + (result["body_battery"] * 0.6)),   # hackathon placeholder
        "steps": int(result["data"]["prev_day_steps"]),
        "calories": int(today.get("HKQuantityTypeIdentifierActiveEnergyBurned", int(result["data"]["prev_day_steps"] * 0.045))),
        "sleepHours": sleep_hours,
    }

    coach = generate_coach(
        status=result["status"],
        battery=int(result["body_battery"]),
        today_raw=result["data"],
        override_reason=result.get("override_reason", "none"),
    )

    return jsonify({
        # what the charts/log expect
        "sleep": trends["sleep"],
        "strain": trends["strain"],
        "stress": trends["stress"],
        "heartRate": trends.get("heartRate", []),
        "calories": trends.get("calories", []),
        "exerciseMinutes": trends.get("exerciseMinutes", []),

        "calendar": calendar,

        # extra analysis block so you can display the ML/“AI buddy” result
        "analysis": {
            "status": result["status"],
            "body_battery": int(result["body_battery"]),
            "coach_summary": coach["coach_summary"],
            "vitals": vitals,
            "action_plan": coach["action_plan"],
            "insights": coach["insights"],
            "debug": {
                "model_status": result.get("model_status"),
                "override_reason": result.get("override_reason"),
                "sleep_stages_mins": {
                    "core": core_mins,
                    "deep": deep_mins,
                    "rem": rem_mins,
                }
            }
        }
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
