# brain.py
import os
import joblib
import numpy as np
import pandas as pd
from typing import Any, Dict, List, Tuple, Optional

DEFAULT_MODEL_PATH = os.environ.get("MODEL_PATH", "./baymax_brain_classifier.pkl")


class HealthKitAdapter:
    @staticmethod
    def calculate_sleep_score(sleep_data: Dict[str, int]) -> float:
        core = float(sleep_data.get("HKCategoryValueSleepAnalysisAsleepCore", 0))
        deep = float(sleep_data.get("HKCategoryValueSleepAnalysisAsleepDeep", 0))
        rem  = float(sleep_data.get("HKCategoryValueSleepAnalysisAsleepREM", 0))
        total_minutes = core + deep + rem
        return float(np.clip((total_minutes / 480.0) * 100.0, 0, 100))

    @staticmethod
    def biometrics_to_raw(bio: Dict[str, Any]) -> Dict[str, Any]:
        sleep_data = bio.get("sleep", {}) or {}
        sleep_score = HealthKitAdapter.calculate_sleep_score(sleep_data)

        rhr = float(bio.get("HKQuantityTypeIdentifierRestingHeartRate", 60))
        steps = float(bio.get("HKQuantityTypeIdentifierStepCount", 0))
        active_min = float(bio.get("HKQuantityTypeIdentifierAppleExerciseTime", 0))
        load = float(bio.get("training_load_score", 0))
        deep_sleep = float(sleep_data.get("HKCategoryValueSleepAnalysisAsleepDeep", 0))

        return {
            "overall_score": float(sleep_score),
            "deep_sleep_in_minutes": float(deep_sleep),
            "resting_heart_rate": float(rhr),
            "prev_day_steps": float(steps),
            "prev_day_active_min": float(active_min),
            "acute_load_24h": float(load),
        }

    @staticmethod
    def process(payload: Dict[str, Any]) -> Dict[str, Any]:
        demo = payload.get("demographics", {}) or {}
        today_raw = HealthKitAdapter.biometrics_to_raw(payload.get("biometrics", {}) or {})
        history_raw = [HealthKitAdapter.biometrics_to_raw(x) for x in (payload.get("history", []) or [])]

        return {
            "demo": {
                "Age": int(demo.get("Age", 30)),
                "Gender": int(demo.get("Gender", 1)),
                "part_of_day_code": int(demo.get("part_of_day_code", 0)),
            },
            "today_raw": today_raw,
            "history_raw": history_raw,
        }

    @staticmethod
    def process_csv_to_payload(filepath: str, demographics: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        df = pd.read_csv(filepath)
        if not {"date", "type", "value"}.issubset(df.columns):
            raise ValueError("CSV must contain columns: date, type, value")

        df = df.sort_values(by="date")
        dates = list(df["date"].unique())
        if len(dates) < 2:
            raise ValueError("CSV must have at least 2 dates (history + today).")

        def _sum(d_str: str, t: str) -> float:
            return float(df[(df["date"] == d_str) & (df["type"] == t)]["value"].sum())

        def _mean(d_str: str, t: str) -> float:
            s = df[(df["date"] == d_str) & (df["type"] == t)]["value"]
            return float(s.mean()) if len(s) else 0.0

        def get_metrics_for_date(d_str: str) -> Dict[str, Any]:
            core = _sum(d_str, "HKCategoryValueSleepAnalysisAsleepCore")
            deep = _sum(d_str, "HKCategoryValueSleepAnalysisAsleepDeep")
            rem  = _sum(d_str, "HKCategoryValueSleepAnalysisAsleepREM")

            return {
                "sleep": {
                    "HKCategoryValueSleepAnalysisAsleepCore": int(core),
                    "HKCategoryValueSleepAnalysisAsleepDeep": int(deep),
                    "HKCategoryValueSleepAnalysisAsleepREM": int(rem),
                },
                "HKQuantityTypeIdentifierRestingHeartRate": _mean(d_str, "HKQuantityTypeIdentifierRestingHeartRate"),
                "HKQuantityTypeIdentifierStepCount": _sum(d_str, "HKQuantityTypeIdentifierStepCount"),
                "HKQuantityTypeIdentifierAppleExerciseTime": _sum(d_str, "HKQuantityTypeIdentifierAppleExerciseTime"),
                "training_load_score": _sum(d_str, "training_load_score"),
                # optional custom stress series for charts (not used by model)
                "stress_score": _mean(d_str, "stress_score"),
            }

        today_metrics = get_metrics_for_date(dates[-1])
        history_metrics = [get_metrics_for_date(d) for d in dates[:-1]]
        demo = demographics or {"Age": 28, "Gender": 1, "part_of_day_code": 0}

        return {"biometrics": today_metrics, "history": history_metrics, "demographics": demo}


class RedGuardrails:
    @staticmethod
    def _mean_std(history_raw: List[Dict[str, Any]], key: str, min_n: int = 7) -> Tuple[Optional[float], Optional[float]]:
        vals = [d.get(key, np.nan) for d in history_raw]
        vals = [float(v) for v in vals if np.isfinite(v)]
        if len(vals) < min_n:
            return None, None
        mu = float(np.mean(vals))
        sd = float(np.std(vals)) + 1e-6
        return mu, sd

    @staticmethod
    def _z(history_raw: List[Dict[str, Any]], key: str, current: float, min_n: int = 7) -> float:
        mu, sd = RedGuardrails._mean_std(history_raw, key, min_n=min_n)
        if mu is None or sd is None:
            return 0.0
        z = (float(current) - mu) / sd
        return float(np.clip(z, -5, 5))

    @staticmethod
    def should_force_red(today_raw: Dict[str, Any], history_raw: List[Dict[str, Any]]) -> Tuple[bool, str]:
        sleep = float(today_raw.get("overall_score", 0))
        rhr   = float(today_raw.get("resting_heart_rate", 0))
        steps = float(today_raw.get("prev_day_steps", 0))

        # Absolute triggers
        if sleep <= 25:
            return True, "sleep_score_very_low"
        if (steps <= 500) and (sleep < 45):
            return True, "bedridden_low_steps_low_sleep"
        if rhr >= 100:
            return True, "resting_hr_extreme_backstop"

        # Baseline-relative triggers
        mu_rhr, _ = RedGuardrails._mean_std(history_raw, "resting_heart_rate", min_n=7)
        z_rhr = RedGuardrails._z(history_raw, "resting_heart_rate", rhr, min_n=7)
        z_sleep = RedGuardrails._z(history_raw, "overall_score", sleep, min_n=7)
        z_steps = RedGuardrails._z(history_raw, "prev_day_steps", steps, min_n=7)

        rhr_delta = (rhr - mu_rhr) if (mu_rhr is not None) else 0.0

        if (z_rhr >= 2.0) and (z_sleep <= -1.0):
            return True, "rhr_spike_plus_sleep_drop"
        if (z_rhr >= 2.0) and (z_steps <= -1.5):
            return True, "rhr_spike_plus_low_steps"
        if (rhr_delta >= 10) and (sleep < 55 or steps < 2000):
            return True, "rhr_delta_10_plus_other_bad_signal"

        return False, "none"


class BaymaxBrain:
    def __init__(self, model_file: str = DEFAULT_MODEL_PATH):
        if not os.path.exists(model_file):
            raise FileNotFoundError(f"Missing model file: {model_file}")

        artifacts = joblib.load(model_file)
        for k in ["model", "features", "windows"]:
            if k not in artifacts:
                raise ValueError(f"Model artifacts missing key: {k}")

        self.model = artifacts["model"]
        self.features = artifacts["features"]
        self.windows = artifacts["windows"]

        self.class_names = artifacts.get("class_names", None)
        if self.class_names is None:
            self.class_names = list(getattr(self.model, "classes_", [0, 1, 2]))

        self._num_to_label = {0: "RED", 1: "YELLOW", 2: "GREEN"}

    def _calculate_z_score(self, history: List[Dict[str, Any]], key: str, current_val: float, min_periods: int) -> float:
        vals = [d.get(key, np.nan) for d in history]
        vals = [float(v) for v in vals if np.isfinite(v)]
        if len(vals) < min_periods:
            return 0.0
        z = (float(current_val) - float(np.mean(vals))) / (float(np.std(vals)) + 1e-6)
        return float(np.clip(z, -5, 5))

    def _make_input_row(self, demo: Dict[str, Any], today: Dict[str, Any], history: List[Dict[str, Any]]) -> pd.DataFrame:
        data: Dict[str, Any] = {}

        raw_cols = [
            "overall_score",
            "deep_sleep_in_minutes",
            "resting_heart_rate",
            "prev_day_steps",
            "prev_day_active_min",
            "acute_load_24h",
        ]

        for c in raw_cols:
            data[c] = float(today.get(c, 0))

        for label, cfg in self.windows.items():
            recent = history[-int(cfg["window"]):] if history else []
            for c in raw_cols:
                z = self._calculate_z_score(recent, c, float(today.get(c, 0)), int(cfg["min_periods"]))
                data[f"z_{label}_{c}"] = float(z)

        for k in ["Age", "Gender", "part_of_day_code"]:
            data[k] = float(demo.get(k, 0))

        df_row = pd.DataFrame([data])
        df_row = df_row.reindex(columns=self.features, fill_value=0.0)
        return df_row.astype(float)

    def _status_from_idx(self, idx: int) -> str:
        cls = self.class_names[idx]
        if isinstance(cls, (int, np.integer)):
            return self._num_to_label.get(int(cls), "YELLOW")

        cls_s = str(cls).upper()
        if cls_s in ("0", "1", "2"):
            return self._num_to_label.get(int(cls_s), "YELLOW")
        if "RED" in cls_s:
            return "RED"
        if "GREEN" in cls_s:
            return "GREEN"
        return "YELLOW"

    def get_advice(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        parsed = HealthKitAdapter.process(payload)
        X = self._make_input_row(parsed["demo"], parsed["today_raw"], parsed["history_raw"])

        probs = self.model.predict_proba(X)[0]
        idx = int(np.argmax(probs))
        model_status = self._status_from_idx(idx)

        score_map = {"RED": 15, "YELLOW": 60, "GREEN": 95}
        battery = int(sum(float(probs[i]) * score_map[self._status_from_idx(i)] for i in range(len(probs))))

        force_red, reason = RedGuardrails.should_force_red(parsed["today_raw"], parsed["history_raw"])
        final_status = "RED" if force_red else model_status
        if force_red:
            battery = min(battery, 40)

        return {
            "status": final_status,
            "body_battery": battery,
            "probs": probs,
            "data": parsed["today_raw"],
            "model_status": model_status,
            "override_reason": reason if force_red else "none",
        }
