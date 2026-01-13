"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { UserData, HealthData, ArchetypeProfile } from "@/app/page"
import { VitalsStrip } from "@/components/vitals-strip"
import { BodyBattery } from "@/components/body-battery"
import { InsightCard } from "@/components/insight-card"
import { TrendsPanel } from "@/components/trends-panel"
import { ActivityLog } from "@/components/activity-log"
import { ProfileDrawer } from "@/components/profile-drawer"
import { Moon, Flame, Brain, BarChart3, LayoutGrid, CalendarDays, User } from "lucide-react"

type Scenario = "current_user" | "athlete" | "average" | "recovery"

interface DashboardProps {
  userData: UserData
  setUserData: React.Dispatch<React.SetStateAction<UserData>>
  healthData: HealthData
  setHealthData: React.Dispatch<React.SetStateAction<HealthData | null>>
  archetype: "current_user" | "athlete" | "average" | "recovery"
  setArchetype: React.Dispatch<React.SetStateAction<"current_user" | "athlete" | "average" | "recovery">>
  stressMod: number
  setStressMod: React.Dispatch<React.SetStateAction<number>>
  initialUserName: string
}

const archetypeProfiles: Record<
  Exclude<Scenario, "current_user">,
  ArchetypeProfile
> = {
  athlete: {
    name: "Marcus Chen",
    age: 26,
    gender: "Male",
    weight: 175,
    height: 72,
    bodyBattery: 94,
    coachText: "Outstanding performance! Your recovery metrics are elite-level.",
    vitals: { heartRate: 58, hrv: 85, steps: 14200, calories: 720 },
  },
  average: {
    name: "Jordan Smith",
    age: 32,
    gender: "Male",
    weight: 165,
    height: 70,
    bodyBattery: 72,
    coachText: "You're doing wonderfully today. Keep listening to your body.",
    vitals: { heartRate: 72, hrv: 52, steps: 7500, calories: 420 },
  },
  recovery: {
    name: "Alex Rivera",
    age: 29,
    gender: "Female",
    weight: 140,
    height: 65,
    bodyBattery: 38,
    coachText: "Focus on rest today. Your body needs time to stabilize and restore.",
    vitals: { heartRate: 78, hrv: 35, steps: 2800, calories: 180 },
  },
}

const generateCalendarData = (archetype: "athlete" | "average" | "recovery") => {
  const calendar: { [date: string]: number } = {}
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  for (let m = -2; m <= 0; m++) {
    const targetMonth = new Date(year, month + m, 1)
    const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), d)
      if (date > now) continue

      const dateStr = date.toISOString().split("T")[0]

      let baseScore: number
      let variance: number

      switch (archetype) {
        case "athlete":
          baseScore = 82
          variance = 15
          break
        case "average":
          baseScore = 65
          variance = 25
          break
        case "recovery":
          baseScore = 42
          variance = 20
          break
      }

      const seed = d + targetMonth.getMonth() * 31
      const pseudoRandom = Math.sin(seed * 9999) * 0.5 + 0.5
      const score = Math.max(10, Math.min(100, Math.round(baseScore + (pseudoRandom - 0.5) * variance * 2)))

      calendar[dateStr] = score
    }
  }

  return calendar
}

const archetypeHealthData: Record<"athlete" | "average" | "recovery", Omit<HealthData, "calendar">> = {
  athlete: {
    sleep: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 7.8 + Math.sin(i) * 0.5 })),
    strain: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 620 + Math.sin(i) * 80 })),
    stress: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 18 + Math.sin(i) * 8 })),
  },
  average: {
    sleep: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 6.8 + Math.sin(i) * 0.8 })),
    strain: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 380 + Math.sin(i) * 100 })),
    stress: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 38 + Math.sin(i) * 15 })),
  },
  recovery: {
    sleep: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 8.2 + Math.sin(i) * 0.4 })),
    strain: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 160 + Math.sin(i) * 50 })),
    stress: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 55 + Math.sin(i) * 10 })),
  },
}

export function Dashboard({
  userData,
  setUserData,
  healthData,
  setHealthData,
  archetype,
  setArchetype,
  stressMod,
  setStressMod,
  initialUserName,
}: DashboardProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [view, setView] = useState<"insights" | "trends" | "log">("insights")
  //const [insightText, setInsightText] = useState("")
  const [showProfile, setShowProfile] = useState(false)
  const [greeting, setGreeting] = useState("Good morning")
  const [isMobile, setIsMobile] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const [draftStressMod, setDraftStressMod] = useState(stressMod)


  


  const backendBattery = healthData.analysis?.body_battery
  const backendCoach = healthData.analysis?.coach_summary
  const backendVitals = healthData.analysis?.vitals

  //const currentBodyBattery = backendBattery ?? (demoMode ? profile.bodyBattery : archetypeProfiles["average"].bodyBattery)

  const analysis = healthData?.analysis

  const currentBodyBattery = analysis?.body_battery ?? 0
  const insightText = analysis?.coach_summary ?? ""
  const currentVitals = analysis?.vitals ?? { heartRate: 60, calories: 0, steps: 0, hrv: 50 }

  const profileForDrawer: ArchetypeProfile =
  archetype === "current_user"
    ? {
        name: initialUserName,
        age: userData.age ?? 28,
        gender: userData.gender ?? "Male",
        weight: userData.weight ?? 165,
        height: userData.height ?? 70,
        bodyBattery: currentBodyBattery,
        coachText: "",
        vitals: currentVitals,
      }
    : archetypeProfiles[archetype]

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")

    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"

    const run = async () => {
      const demographics = {
        Age: userData.age ?? 28,
        Gender: userData.gender === "Female" ? 0 : 1,
        part_of_day_code: 0,
      }

      // Demo ON: use selected archetype + slider
      // Demo OFF: still call backend, but keep it "normal"
      const scenarioToSend = archetype
      const stressToSend = stressMod

      const res = await fetch(`${API_BASE}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: scenarioToSend,
          days: 14,
          stress_mod: stressToSend,
          seed: 7,
          demographics,
        }),
      })

      if (!res.ok) return
      const data = (await res.json()) as HealthData
      setHealthData(data)
    }

    run()
  }, [demoMode, archetype, stressMod, userData.age, userData.gender, setHealthData])


  // useEffect(() => {
  //   const targetText = backendCoach ?? (demoMode ? profile.coachText : archetypeProfiles["average"].coachText)
  //   setInsightText("")
  //   let index = 0
  //   const timer = setInterval(() => {
  //     if (index <= targetText.length) {
  //       setInsightText(targetText.slice(0, index))
  //       index++
  //     } else {
  //       clearInterval(timer)
  //     }
  //   }, 40)
  //   return () => clearInterval(timer)
  // }, [profile.coachText, demoMode])

  useEffect(() => {
    if (!demoMode) return

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"

    const demographics = {
      Age: userData.age ?? 28,
      Gender: userData.gender === "Female" ? 0 : 1,
      part_of_day_code: 0,
    }

    const controller = new AbortController()

    // debounce so slider drags don’t spam
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            scenario: archetype,
            days: 14,
            stress_mod: stressMod,
            seed: 7,
            demographics,
          }),
        })

        if (!res.ok) return
        const data = (await res.json()) as HealthData
        setHealthData(data)
      } catch {
        // ignore aborts/offline
      }
    }, 250)

    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [demoMode, archetype, stressMod, userData.age, userData.gender, setHealthData])

  useEffect(() => {
    if (showProfile) setDraftStressMod(stressMod)
  }, [showProfile])


  const handleArchetypeChange = (newArchetype: "current_user" | "athlete" | "average" | "recovery") => {
    setArchetype(newArchetype)

    // Only mutate "fake user" fields while demo mode is on
    if (!demoMode) return

    const handleArchetypeChange = (newArchetype: Scenario) => {
    setArchetype(newArchetype)

    if (!demoMode || newArchetype === "current_user") return

    const newProfile = archetypeProfiles[newArchetype]
    setUserData({
      ...userData,
      name: newProfile.name,
      age: newProfile.age,
      gender: newProfile.gender,
      weight: newProfile.weight,
      height: newProfile.height,
    })
}


    // IMPORTANT: do NOT setHealthData here — the useEffect will refetch backend
  }

  const handleDemoModeChange = (enabled: boolean) => {
    setDemoMode(enabled)
    if (!enabled) {
      // Reset to user's initial data when turning off demo mode
      setStressMod(1.0)          // reset slider
      setArchetype("current_user")    // neutral
      setUserData({ ...userData, name: initialUserName }) // restore name
    }
  }

  const displayName = demoMode ? profileForDrawer.name : initialUserName

  //const currentVitals = backendVitals ?? (demoMode ? profile.vitals : archetypeProfiles["average"].vitals)

  const sleepAvg = (healthData.sleep.reduce((sum, d) => sum + d.value, 0) / healthData.sleep.length).toFixed(1)
  const caloriesAvg = (healthData.strain.reduce((sum, d) => sum + d.value, 0) / healthData.strain.length).toFixed(0)
  const exerciseAvg = (healthData.stress.reduce((sum, d) => sum + d.value, 0) / healthData.stress.length).toFixed(0)

  const todaySleep = healthData.sleep.at(-1)?.value ?? 0
  const todayCalories = healthData.calories?.at(-1)?.value ?? 0
  const todayStress = healthData.stress.at(-1)?.value ?? 0

  const sleepScore = Math.round(Math.min(100, todaySleep * 12))            // 8.3h -> ~100
  const movementScore = Math.round(Math.min(100, todayCalories / 8))            // 800 kcal -> 100
  const mindScore = Math.round(Math.max(0, Math.min(100, 100 - todayStress))) // stress 40 -> 60

  const plan = healthData.analysis?.action_plan
console.log("ACTION_PLAN", plan)

const toActions = (raw: unknown): string[] => {
  if (typeof raw !== "string") return []
  return raw
    .split(/[.;,]\s*/g)
    .map((s: string) => s.trim())
    .filter(Boolean)
}

const sleepActions = toActions(plan?.sleep?.action)
const movementActions = toActions(plan?.movement?.action)
const mindActions = toActions(plan?.recovery?.action) 


  const cards = [
    {
      id: "sleep",
      title: "Rest & Recovery",
      score: `${sleepScore}/100`,
      icon: Moon,
      color: "#3b82f6",
      videoId: "W6_I9vY-tS4",
      actions: sleepActions,
      sleepStagesMins: healthData.analysis?.debug?.sleep_stages_mins,
      details: [
        `Average sleep: ${todaySleep}h per night`,
        "Deep sleep: 1.8h average",
        "REM sleep: 2.1h average",
        "Sleep consistency: 85%",
      ],
    },
    {
      id: "activity",
      title: "Movement & Energy",
      score: `${movementScore}/100`,
      icon: Flame,
      color: "#f97316",
      videoId: "https://www.youtube.com/watch?v=9PCGvkXV-Bo",
      actions: movementActions,
      details: [
        `Calories burned: ${todayCalories} kcal/day`,
        "Active minutes: 45 min average",
        `Steps: ${currentVitals.steps.toLocaleString()} daily average`,
        "Movement frequency: Good",
      ],
    },
    {
      id: "mind",
      title: "Mind & Balance",
      score: `${mindScore}/100`,
      icon: Brain,
      color: "#8b5cf6",
      videoId: "https://www.youtube.com/watch?v=wfDTp2GogaQ",
      actions: mindActions,
      details: [
        `Stress level: ${todayStress}% average`,
        "Recovery time: Optimal",
        `HRV: ${currentVitals.hrv}ms average`,
        "Mindfulness: 15 min/day",
      ],
    },
  ]



  return (
    <div className="relative z-10 min-h-[100dvh] px-4 py-8 md:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-start justify-between gap-4"
        >
          <div className="flex-1 pt-2">
            <p className="text-lg text-white/50">{greeting},</p>
            <h1 className="text-[clamp(2rem,6vw,4rem)] font-semibold tracking-tighter text-white leading-tight">
              {displayName}
            </h1>
          </div>

          <button
            onClick={() => setShowProfile(true)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 ring-2 ring-cyan-400/50 transition-all hover:ring-cyan-400"
            style={{ boxShadow: "0 0 20px rgba(34,211,238,0.3)" }}
          >
            <User className="h-6 w-6 text-cyan-400" />
          </button>
        </motion.div>

        {isMobile ? (
          <>
            {/* Mobile: Vitals Strip */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <VitalsStrip vitals={currentVitals} sleepHours={Number(sleepAvg)} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="my-8 text-center"
            >
              <p className="text-[clamp(1.5rem,5vw,2.5rem)] font-bold leading-tight tracking-tight text-white">
                {insightText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-1 bg-cyan-400"
                />
              </p>
            </motion.div>

            {/* Mobile: Body Battery (circle only, no text) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <BodyBattery value={currentBodyBattery} insightText="" isMobile={true} />
            </motion.div>
          </>
        ) : (
          <>
            {/* Desktop: Original order */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <VitalsStrip vitals={currentVitals} sleepHours={Number(sleepAvg)} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <BodyBattery value={currentBodyBattery} insightText={insightText} />
            </motion.div>
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8 flex justify-center gap-2"
        >
          <button
            onClick={() => setView("insights")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              view === "insights"
                ? "bg-white text-[#0f172a]"
                : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Insights
          </button>
          <button
            onClick={() => setView("trends")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              view === "trends"
                ? "bg-white text-[#0f172a]"
                : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Trends
          </button>
          <button
            onClick={() => setView("log")}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              view === "log"
                ? "bg-white text-[#0f172a]"
                : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Activity Log
          </button>
        </motion.div>

        {/* Content Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {view === "insights" && (
            <div className="space-y-4">
              {cards.map((card, index) => (
                <InsightCard
                  key={card.id}
                  card={card}
                  index={index}
                  isExpanded={expandedCard === card.id}
                  onToggle={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                />
              ))}
            </div>
          )}
          {view === "trends" && <TrendsPanel healthData={healthData} />}
          {view === "log" && <ActivityLog calendarData={healthData.calendar || {}} />}
        </motion.div>
      </div>

      {/* Profile Drawer */}
      {showProfile && (
        <ProfileDrawer
          userData={userData}
          profile={profileForDrawer}
          onClose={() => setShowProfile(false)}
          onArchetypeChange={handleArchetypeChange}
          currentArchetype={archetype}
          demoMode={demoMode}
          onDemoModeChange={handleDemoModeChange}
          initialUserName={initialUserName}
          stressMod={draftStressMod}
          onStressModChange={setDraftStressMod}
          onApplyStress={() => setStressMod(draftStressMod)}
        />
      )}
    </div>
  )
}
