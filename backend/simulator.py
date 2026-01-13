# simulator.py
import os
import numpy as np
import pandas as pd
from datetime import date, timedelta
from typing import Any, Dict, List, Tuple

ARCHETYPES = {
    # name: (sleep_mean_hours, sleep_std), (rhr_mean, rhr_std), (steps_mean, steps_std)
    "athlete":  ((8.4, 0.4), (52, 3), (14000, 1200)),
    "average":  ((7.0, 0.6), (68, 4), (6500, 900)),
    "recovery": ((6.0, 1.0), (80, 6), (2500, 600)),
}

def _split_sleep(total_minutes: int) -> Tuple[int, int, int]:
    # stable-ish stage ratios; tweak if you want
    deep = int(total_minutes * 0.18)
    rem  = int(total_minutes * 0.22)
    core = max(0, total_minutes - deep - rem)
    return core, deep, rem

def generate_day(archetype: str, stress_mod: float, rng: np.random.Generator) -> Dict[str, Any]:
    """
    stress_mod:
      1.0 = normal
      >1.0 = more stressed (worse sleep, higher rhr, fewer steps)
      <1.0 = calmer (better sleep, lower rhr, more steps)
    """
    if archetype not in ARCHETYPES:
        archetype = "average"

    (sleep_mu, sleep_sd), (rhr_mu, rhr_sd), (steps_mu, steps_sd) = ARCHETYPES[archetype]

    m = float(np.clip(stress_mod, 0.6, 1.6))  # keep sane

    # stressed day => less sleep, higher rhr, fewer steps
    sleep_mod = 1.0 - 0.25 * (m - 1.0)        # at 1.4 => ~ -10%
    rhr_mod   = 1.0 + 0.15 * (m - 1.0)        # at 1.4 => ~ +6%
    step_mod  = 1.0 - 0.35 * (m - 1.0)        # at 1.4 => ~ -14%

    sleep_h = float(rng.normal(sleep_mu, sleep_sd)) * sleep_mod
    sleep_h = float(np.clip(sleep_h, 3.0, 10.5))
    total_mins = int(sleep_h * 60)

    core, deep, rem = _split_sleep(total_mins)

    rhr = int(rng.normal(rhr_mu, rhr_sd) * rhr_mod)
    rhr = int(np.clip(rhr, 40, 110))

    steps = int(rng.normal(steps_mu, steps_sd) * step_mod)
    steps = int(max(0, steps))

    active_min = int(steps * 0.01)
    calories = int(steps * 0.045)
    load = int(active_min * (rhr / 60.0) * 1.5)

    # chart-only stress score derived from multiplier (optional)
    stress_score = float(np.clip(50 + (m - 1.0) * 80 + rng.normal(0, 6), 0, 100))

    return {
        "sleep": {
            "HKCategoryValueSleepAnalysisAsleepCore": core,
            "HKCategoryValueSleepAnalysisAsleepDeep": deep,
            "HKCategoryValueSleepAnalysisAsleepREM": rem,
        },
        "HKQuantityTypeIdentifierRestingHeartRate": rhr,
        "HKQuantityTypeIdentifierStepCount": steps,
        "HKQuantityTypeIdentifierAppleExerciseTime": active_min,
        "HKQuantityTypeIdentifierActiveEnergyBurned": calories,
        "training_load_score": load,
        "stress_score": stress_score,
    }

def generate_payload(
    scenario: str,
    days: int = 14,
    stress_mod: float = 1.0,   # <— multiplier
    seed: int = 7,
    demographics: Dict[str, Any] | None = None,
) -> Dict[str, Any]:
    rng = np.random.default_rng(seed)

    # History: normal days (stress_mod = 1.0)
    history = [generate_day(scenario, stress_mod=1.0, rng=rng) for _ in range(max(1, days - 1))]

    # Today: apply stress_mod
    today = generate_day(scenario, stress_mod=float(stress_mod), rng=rng)

    demo = demographics or {"Age": 28, "Gender": 1, "part_of_day_code": 0}
    return {"demographics": demo, "history": history, "biometrics": today}


def payload_to_trends(payload: Dict[str, Any]) -> Dict[str, Any]:
    all_days = payload["history"] + [payload["biometrics"]]

    sleep = []
    strain = []           # training_load_score (keep meaning)
    stress = []           # stress_score (keep meaning)

    calories = []         # kcal trend (derived if missing)
    exerciseMinutes = []  # minutes trend
    heartRate = []        # NEW: resting HR trend

    for i, d in enumerate(all_days, start=1):
        # --- Sleep hours ---
        s = d.get("sleep", {}) or {}
        sleep_mins = float(
            s.get("HKCategoryValueSleepAnalysisAsleepCore", 0)
            + s.get("HKCategoryValueSleepAnalysisAsleepDeep", 0)
            + s.get("HKCategoryValueSleepAnalysisAsleepREM", 0)
        )
        sleep.append({"day": f"Day {i}", "value": round(sleep_mins / 60.0, 1)})

        # --- Keep existing semantics ---
        strain.append({"day": f"Day {i}", "value": float(d.get("training_load_score", 0) or 0)})
        stress.append({"day": f"Day {i}", "value": float(d.get("stress_score", 0) or 0)})

        # --- Heart rate trend (resting HR) ---
        rhr = float(d.get("HKQuantityTypeIdentifierRestingHeartRate", 60) or 60)
        heartRate.append({"day": f"Day {i}", "value": rhr})

        # --- Exercise minutes ---
        steps = float(d.get("HKQuantityTypeIdentifierStepCount", 0) or 0)
        ex_min = float(d.get("HKQuantityTypeIdentifierAppleExerciseTime", steps * 0.01) or 0)
        exerciseMinutes.append({"day": f"Day {i}", "value": ex_min})

        # --- Calories trend ---
        cal = d.get("HKQuantityTypeIdentifierActiveEnergyBurned", None)
        if cal is None:
            # Simple, believable derivation (CSV doesn't have calories)
            cal = steps * 0.045 + ex_min * 4.0
        calories.append({"day": f"Day {i}", "value": float(cal)})

    return {
        "sleep": sleep,
        "strain": strain,
        "stress": stress,
        "calories": calories,
        "exerciseMinutes": exerciseMinutes,
        "heartRate": heartRate,
    }



def generate_calendar(base: float, variance: float, days_back: int = 90, seed: int = 123) -> Dict[str, int]:
    rng = np.random.default_rng(seed)
    cal: Dict[str, int] = {}
    today = date.today()
    for k in range(days_back):
        d = today - timedelta(days=days_back - 1 - k)
        score = int(np.clip(rng.normal(base, variance), 10, 100))
        cal[d.isoformat()] = score
    return cal

def scenario_defaults(scenario: str) -> Tuple[float, float]:
    if scenario == "athlete":
        return 82.0, 12.0
    if scenario == "recovery":
        return 42.0, 18.0
    return 65.0, 20.0

def write_scenario_csv(scenario: str, out_path: str, days: int = 30, stress_level: float = 45.0, seed: int = 7):
    payload = generate_payload(scenario, days=days, stress_level=stress_level, seed=seed)
    rows = []
    start = date.today() - timedelta(days=days - 1)

    all_days = payload["history"] + [payload["biometrics"]]
    for i, d in enumerate(all_days):
        ds = (start + timedelta(days=i)).isoformat()

        s = d["sleep"]
        rows += [
            (ds, "HKCategoryValueSleepAnalysisAsleepCore", s["HKCategoryValueSleepAnalysisAsleepCore"]),
            (ds, "HKCategoryValueSleepAnalysisAsleepDeep", s["HKCategoryValueSleepAnalysisAsleepDeep"]),
            (ds, "HKCategoryValueSleepAnalysisAsleepREM",  s["HKCategoryValueSleepAnalysisAsleepREM"]),
        ]
        rows += [
            (ds, "HKQuantityTypeIdentifierRestingHeartRate", d["HKQuantityTypeIdentifierRestingHeartRate"]),
            (ds, "HKQuantityTypeIdentifierStepCount", d["HKQuantityTypeIdentifierStepCount"]),
            (ds, "HKQuantityTypeIdentifierAppleExerciseTime", d["HKQuantityTypeIdentifierAppleExerciseTime"]),
            (ds, "training_load_score", d["training_load_score"]),
            (ds, "stress_score", d.get("stress_score", 0)),
        ]

    df = pd.DataFrame(rows, columns=["date", "type", "value"])
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    df.to_csv(out_path, index=False)
