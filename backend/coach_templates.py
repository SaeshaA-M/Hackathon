# coach_templates.py
import random
from typing import Any, Dict, List

def _pick(options: List[str]) -> str:
    return random.choice(options)

def generate_coach(status: str, battery: int, today_raw: Dict[str, Any], override_reason: str) -> Dict[str, Any]:
    sleep = float(today_raw.get("overall_score", 0))
    rhr = float(today_raw.get("resting_heart_rate", 0))
    steps = float(today_raw.get("prev_day_steps", 0))
    load = float(today_raw.get("acute_load_24h", 0))

    # --- Coach summary (tone) ---
    if status == "GREEN":
        openers = [
            "All systems go.",
            "You’re in a strong spot today.",
            "Nice—your recovery signals look solid.",
            "This is a good day to build momentum.",
        ]
    elif status == "YELLOW":
        openers = [
            "Steady today—let’s be intentional.",
            "You’re okay, but your body’s asking for balance.",
            "Not a red day—just don’t overreach.",
            "Let’s keep today smooth and controlled.",
        ]
    else:
        openers = [
            "Today looks rough—let’s protect recovery.",
            "Warning lights are on. Keep it gentle.",
            "Let’s stabilize first, then build.",
            "Small wins only today—recover first.",
        ]

    coach_summary = f"{_pick(openers)} Your Body Battery is at {battery}%."
    if override_reason != "none":
        coach_summary += " I’m flagging recovery as a priority today."

    # --- Insight candidates (negative + positive) ---
    insights: List[Dict[str, Any]] = []

    # Negative / caution insights
    if sleep < 55:
        insights.append({
            "tag": "sleep",
            "title": "Sleep was lighter than ideal",
            "why_this": f"Your sleep score is {int(sleep)}—energy may dip faster today.",
            "what_to_do": [
                "Keep caffeine earlier in the day",
                "Aim for a slightly earlier bedtime tonight",
            ],
            "priority": "high" if sleep < 40 else "med",
        })

    if rhr >= 78:
        insights.append({
            "tag": "recovery",
            "title": "Resting heart rate is elevated",
            "why_this": f"Your RHR is {int(rhr)} bpm—your system may be under stress.",
            "what_to_do": [
                "Keep intensity low today",
                "Hydrate early + short walk after lunch",
            ],
            "priority": "med",
        })

    if steps < 2500 and status != "GREEN":
        insights.append({
            "tag": "movement",
            "title": "Movement is low",
            "why_this": f"Steps were {int(steps)}—a little movement helps mood and recovery.",
            "what_to_do": [
                "10–20 min easy walk",
                "5 minutes of light stretching",
            ],
            "priority": "med",
        })

    if load > 650 and status != "GREEN":
        insights.append({
            "tag": "movement",
            "title": "High load without enough recovery",
            "why_this": "Your recent load is high relative to recovery signals.",
            "what_to_do": [
                "Swap intensity for an easy session",
                "Prioritize a calm evening routine",
            ],
            "priority": "high",
        })

    # Positive insights (ALWAYS allow these, especially for GREEN)
    positive_candidates: List[Dict[str, Any]] = []

    if sleep >= 75:
        positive_candidates.append({
            "tag": "sleep",
            "title": "Sleep quality looks strong",
            "why_this": f"Sleep score {int(sleep)} sets you up for steadier energy.",
            "what_to_do": [
                "Repeat the same bedtime window tonight",
                "Get bright light early (even 5–10 minutes)",
            ],
            "priority": "med",
        })

    if steps >= 8000:
        positive_candidates.append({
            "tag": "movement",
            "title": "Great movement volume",
            "why_this": f"{int(steps):,} steps is a solid base for mood + cardio health.",
            "what_to_do": [
                "Keep it consistent—short walk is enough",
                "Add 5 minutes of mobility if you have time",
            ],
            "priority": "low",
        })

    if rhr <= 62:
        positive_candidates.append({
            "tag": "recovery",
            "title": "Recovery looks calm",
            "why_this": f"RHR {int(rhr)} bpm usually signals lower strain on the system.",
            "what_to_do": [
                "If you train today, keep the warm-up long",
                "Hydrate normally and eat on schedule",
            ],
            "priority": "low",
        })

    if 250 <= load <= 650 and status == "GREEN":
        positive_candidates.append({
            "tag": "movement",
            "title": "Nice balance of work + recovery",
            "why_this": "Your load looks productive without being excessive.",
            "what_to_do": [
                "If you push today, keep it short and clean",
                "Plan a lighter day tomorrow if needed",
            ],
            "priority": "low",
        })

    # Shuffle and add positives if needed
    random.shuffle(positive_candidates)

    # Ensure ALWAYS 2–4 insights total
    # 1) If we have < 2, top up with positives
    for c in positive_candidates:
        if len(insights) >= 4:
            break
        insights.append(c)
        if len(insights) >= 2:
            break

    # 2) Still < 2? add generic positive(s)
    if len(insights) < 2:
        insights.append({
            "tag": "recovery",
            "title": "You’re trending in the right direction",
            "why_this": "Your signals look stable—consistency is the win.",
            "what_to_do": [
                "Keep meals + hydration steady",
                "Take a short walk break today",
            ],
            "priority": "low",
        })
    if len(insights) < 2:
        insights.append({
            "tag": "sleep",
            "title": "Protect tonight’s sleep",
            "why_this": "Even on great days, sleep is how you lock in the gains.",
            "what_to_do": [
                "Avoid heavy screen time in the last 20 minutes",
                "Set a realistic lights-out target",
            ],
            "priority": "low",
        })

    # --- Action plan (still concise) ---
    if status == "RED":
        action_plan = {
            "sleep": {"title": "Sleep", "action": "Prioritize an earlier bedtime + a calm wind-down."},
            "movement": {"title": "Movement", "action": "Keep it gentle: easy walk + light mobility only."},
            "recovery": {"title": "Recovery", "action": "Hydrate + 3 minutes of slow breathing."},
        }
    elif status == "YELLOW":
        action_plan = {
            "sleep": {"title": "Sleep", "action": "Keep bedtime consistent; avoid late caffeine."},
            "movement": {"title": "Movement", "action": "Moderate session or long walk—no max effort."},
            "recovery": {"title": "Recovery", "action": "Hydrate and take a 10-minute downshift break."},
        }
    else:
        action_plan = {
            "sleep": {"title": "Sleep", "action": "Repeat last night’s routine to keep momentum."},
            "movement": {"title": "Movement", "action": "If you train, keep it sharp—not chaotic."},
            "recovery": {"title": "Recovery", "action": "Hydrate + quick mobility to stay fresh."},
        }

    return {"coach_summary": coach_summary, "insights": insights[:4], "action_plan": action_plan}
