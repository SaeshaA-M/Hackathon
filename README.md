# 🩺 Baymax – AI-Powered Digital Health Companion

Baymax is a full-stack web application that simulates an intelligent digital health companion. It combines a **machine-learning powered backend** with a **highly interactive, animated frontend** to deliver personalized health insights, recovery metrics, and actionable wellness recommendations. This AI-powered personalized health buddy to address the gap between widespread health data collection and meaningful behavioral change. While health platforms generate copious amounts of data on sleep, activity, and energy usage, users often lack actionable insights to guide daily decisions. This solution applies machine learning to time-series data and energy scores, the system will learn about individual recovery and fatigue patterns, while also providing adaptive, daily recommendations for sleep, excercise, and nutrition. By translating raw health metrics into personalized, explainable guidance, the system supports energy-aware decision-making and sustainable healthy habits. The expected impact is improved engagement with personal health data, and better long-term wellbeing through data-driven lifestyle support.

---

## 🔹 Project Overview

The application walks a user through:
1. A conversational onboarding experience  
2. Goal selection and profile creation  
3. A simulated “health scan”  
4. A dynamic health dashboard powered by an ML-driven backend  

The system supports **real-time scenario simulation**, allowing users to explore how stress, lifestyle, and activity levels impact overall health.

---

## 🧠 Back-End (ML + API)

### Technologies Used
- Python
- FastAPI / Flask-style API
- Gunicorn (production server)
- XGBoost / Scikit-learn
- NumPy / Pandas
- Joblib (model persistence)

### Core Back-End Files

#### `app.py`
- Main API entry point
- Defines REST endpoints (e.g. `/api/simulate`)
- Handles incoming simulation requests from the frontend
- Loads ML models and orchestrates inference
- Designed to run in production via:
  ```bash
  gunicorn app:app --bind 0.0.0.0:10000
  ```

#### `brain.py`
- Encapsulates ML inference logic
- Loads the trained classifier
- Converts model outputs into interpretable health signals

#### `simulator.py`
- Generates time-series health data (sleep, strain, stress, calories, vitals)
- Applies scenario logic (athlete, average, recovery, current user)
- Supports environmental modifiers such as stress level

#### `coach_templates.py`
- Produces human-readable coaching summaries
- Generates action plans for:
  - Sleep & recovery
  - Movement & energy
  - Stress & mental balance

#### `baymax_brain_classifier.pkl`
- Serialized machine-learning model
- Used to classify health state and compute:
  - Body battery score
  - Status (GREEN / YELLOW / RED)

#### `requirements.txt`
- Defines all backend dependencies for deployment and reproducibility

---

## 🎨 Front-End (Next.js + React)

### Technologies Used
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)
- Lucide Icons

---

## 🧩 Front-End Architecture

### App-Level Files

#### `layout.tsx`
- Root layout wrapper
- Global metadata and viewport settings
- Analytics integration

#### `page.tsx`
- Main application controller
- Manages high-level state transitions:
  - Onboarding → Goals → Scanning → Dashboard
- Holds shared types (`UserData`, `HealthData`, `Scenario`)
- Passes backend data to child components

#### `globals.css`
- Custom design system
- Dark, “cosmic” aesthetic theme
- Tailwind configuration and animations

---

## 🧠 Core UI Components

### Onboarding & Flow
- `onboarding-screen.tsx` – Conversational introduction
- `goals-screen.tsx` – Goal selection with animated cards
- `auth-modal.tsx` – Profile creation & permissions flow
- `scanning-screen.tsx` – Simulated health scan with backend call

### Dashboard & Insights
- `dashboard.tsx` – Main analytics hub
- `body-battery.tsx` – Circular animated body battery indicator
- `vitals-strip.tsx` – Live vitals (heart rate, calories, sleep)
- `insight-card.tsx` – Expandable insight panels with actions
- `activity-log.tsx` – Calendar-style health history
- `trends-panel.tsx` – 14-day trend charts (sleep, HR, calories)

### Profile & Simulation
- `profile-drawer.tsx`
  - Demo mode toggle
  - Archetype switching (Athlete / Average / Recovery)
  - Stress modifier slider
  - Live backend re-simulation

### Visual Effects & Utilities
- `starfield.tsx` – Canvas-based animated starfield background
- `theme-provider.tsx` – Theme management
- `connection-modal.tsx` – Device connection UX (simulated)

---

## 🔗 Front-End ↔ Back-End Integration

- Front end communicates with the backend via:
  ```ts
  process.env.NEXT_PUBLIC_API_BASE_URL
  ```
- Primary API endpoint:
  ```
  POST /api/simulate
  ```
- Payload includes:
  - Scenario
  - Stress modifier
  - Demographics
  - Time horizon (days)

- Backend response provides:
  - Time-series health data
  - ML-generated analysis
  - Body battery score
  - Coaching summary
  - Action plans

---

## 🚀 Key Features

- ML-driven health classification
- Real-time scenario simulation
- Fully animated, production-quality UI
- Modular, scalable architecture
- Clean separation of concerns (UI, logic, ML, data)
- Deployment-ready backend and frontend

---

## 🏁 Current Status

✅ Backend fully operational with Gunicorn  
✅ Frontend fully wired to backend  
✅ Environment-based configuration supported  
✅ Ready for deployment and future expansion  

---

## 🔮 Possible Extensions

- Real wearable data ingestion (Apple Health / Fitbit)
- Authentication & user persistence
- Long-term trend storage
- Model retraining with real-world data
- Mobile app adaptation
