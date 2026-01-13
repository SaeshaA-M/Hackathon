"use client"

import { useState } from "react"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { GoalsScreen } from "@/components/goals-screen"
import { AuthModal } from "@/components/auth-modal"
import { ScanningScreen } from "@/components/scanning-screen"
import { Dashboard } from "@/components/dashboard"
import { Starfield } from "@/components/starfield"

export type HealthData = {
  sleep: { day: string; value: number }[]
  strain: { day: string; value: number }[]
  stress: { day: string; value: number }[]
  calendar: { [date: string]: number }

  heartRate?: { day: string; value: number }[]
  calories?: { day: string; value: number }[]
  exerciseMinutes?: { day: string; value: number }[]

  analysis?: {
    status: "RED" | "YELLOW" | "GREEN"
    body_battery: number
    coach_summary: string
    vitals: {
      heartRate: number
      hrv: number
      steps: number
      calories: number
      sleepHours?: number
    }
    action_plan: any
    insights: any[]
    debug?: any
  }
}


export type UserData = {
  name: string
  goals: string[]
  email?: string
  age?: number
  gender?: string
  weight?: number
  height?: number
}

export type ArchetypeProfile = {
  name: string
  age: number
  gender: string
  weight: number
  height: number
  bodyBattery: number
  coachText: string
  vitals: {
    heartRate: number
    hrv: number
    steps: number
    calories: number
  }
}

export type Scenario = "current_user" | "athlete" | "average" | "recovery"

export default function HealthCompanion() {
  const [stage, setStage] = useState<"onboarding" | "goals" | "scanning" | "dashboard">("onboarding")
  const [userData, setUserData] = useState<UserData>({ name: "", goals: [] })
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  type Scenario = "current_user" | "athlete" | "average" | "recovery"
  const [archetype, setArchetype] = useState<Scenario>("current_user")
  const [stressMod, setStressMod] = useState<number>(1.0)
  const [initialUserName, setInitialUserName] = useState("")

  const handleOnboardingComplete = (name: string) => {
    setUserData((prev) => ({ ...prev, name }))
    setInitialUserName(name)
    setStage("goals")
  }

  const handleGoalsComplete = (goals: string[]) => {
    setUserData((prev) => ({ ...prev, goals }))
    setShowAuthModal(true)
  }

  const handleAuthComplete = (email: string) => {
    setUserData((prev) => ({
      ...prev,
      email,
      age: 28,
      gender: "Male",
      weight: 165,
      height: 70,
    }))
    setShowAuthModal(false)
    setStage("scanning")
  }

  const handleScanComplete = (data: HealthData) => {
    setHealthData(data)
    setStage("dashboard")
  }

  const getEnvironmentStatus = () => {
    if (!healthData?.analysis) return "default"

    // Prefer explicit model status if available
    if (healthData.analysis.status) {
      switch (healthData.analysis.status) {
        case "GREEN":
          return "green"
        case "YELLOW":
          return "yellow"
        case "RED":
          return "red"
      }
    }

    // Fallback: infer from body battery
    const battery = healthData.analysis.body_battery

    if (battery < 45) return "red"
    if (battery >= 80) return "green"
    return "yellow"
  }


  const environmentStatus = getEnvironmentStatus()

  const getMeshColors = () => {
    switch (environmentStatus) {
      case "green":
        return {
          orb1: "bg-emerald-600/25",
          orb2: "bg-teal-600/25",
          orb3: "bg-cyan-500/15",
        }
      case "yellow":
        return {
          orb1: "bg-amber-600/25",
          orb2: "bg-yellow-600/25",
          orb3: "bg-orange-500/15",
        }
      case "red":
        return {
          orb1: "bg-rose-700/30",
          orb2: "bg-violet-800/30",
          orb3: "bg-orange-700/20",
        }
      default:
        return {
          orb1: "bg-purple-600/30",
          orb2: "bg-blue-600/30",
          orb3: "bg-violet-500/20",
        }
    }
  }

  const meshColors = getMeshColors()

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#0f172a]">
      <Starfield />

      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <div
          className={`fixed -left-32 -top-32 h-[400px] w-[400px] rounded-full ${meshColors.orb1} blur-[100px] opacity-60 transition-colors duration-1000 md:h-[600px] md:w-[600px] md:-left-40 md:-top-40 md:blur-[120px] md:opacity-100`}
        />
        <div
          className={`fixed -bottom-32 -right-32 h-[450px] w-[450px] rounded-full ${meshColors.orb2} blur-[100px] opacity-60 transition-colors duration-1000 md:h-[700px] md:w-[700px] md:-bottom-40 md:-right-40 md:blur-[120px] md:opacity-100`}
        />
        <div
          className={`fixed left-1/2 top-1/3 h-[250px] w-[250px] -translate-x-1/2 rounded-full ${meshColors.orb3} blur-[80px] opacity-50 transition-colors duration-1000 md:h-[400px] md:w-[400px] md:top-1/2 md:-translate-y-1/2 md:blur-[100px] md:opacity-100`}
        />
      </div>

      {stage === "onboarding" && <OnboardingScreen onComplete={handleOnboardingComplete} />}
      {stage === "goals" && <GoalsScreen userName={userData.name} onComplete={handleGoalsComplete} />}
      {stage === "scanning" && (
        <ScanningScreen
          userData={userData}
          scenario={archetype}
          stressMod={stressMod}
          onComplete={handleScanComplete}
        />
      )}
      {stage === "dashboard" && healthData && (
        <Dashboard
          userData={userData}
          setUserData={setUserData}
          healthData={healthData}
          setHealthData={setHealthData}
          archetype={archetype}
          setArchetype={setArchetype}
          stressMod={stressMod}
          setStressMod={setStressMod}
          initialUserName={initialUserName}
        />
      )}

      {showAuthModal && (
        <AuthModal userName={userData.name} onComplete={handleAuthComplete} onClose={() => setShowAuthModal(false)} />
      )}
    </main>
  )
}
