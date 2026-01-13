"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { Scenario, UserData, HealthData } from "@/app/page"

const generateInitialCalendarData = () => {
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
      const seed = d + targetMonth.getMonth() * 31
      const pseudoRandom = Math.sin(seed * 9999) * 0.5 + 0.5
      const score = Math.max(10, Math.min(100, Math.round(65 + (pseudoRandom - 0.5) * 50)))
      calendar[dateStr] = score
    }
  }
  return calendar
}

const statusMessages = ["Connecting to health data...", "Syncing health history...", "Analysis complete."]



interface ScanningScreenProps {
  userData: UserData
  scenario: Scenario
  stressMod: number
  onComplete: (data: HealthData) => void
}


export function ScanningScreen({ userData, scenario, stressMod, onComplete }: ScanningScreenProps) {
  const [statusIndex, setStatusIndex] = useState(0)
  
  useEffect(() => {
    const fetchData = async () => {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050"

      const demographics = {
        Age: userData.age ?? 28,
        Gender: userData.gender === "Female" ? 0 : 1,
        part_of_day_code: 0,
      }

      console.log("Calling backend:", `${API_BASE}/api/simulate`, { scenario, stress_mod: stressMod, demographics })

      try {
        const response = await fetch(`${API_BASE}/api/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenario,
            days: 14,
            stress_mod: stressMod,
            seed: 7,
            demographics,
          }),
        })

        console.log("Backend response status:", response.status)

        if (!response.ok) throw new Error("Backend offline")
        const data = (await response.json()) as HealthData

        return {
          ...data,
          calendar: data.calendar || generateInitialCalendarData(),
        } as HealthData
      } catch {
        return {
          sleep: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 7 })),
          strain: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 400 })),
          stress: Array.from({ length: 14 }, (_, i) => ({ day: `Day ${i + 1}`, value: 40 })),
          calendar: generateInitialCalendarData(),
        } as HealthData
      }

    }

    const statusTimer1 = setTimeout(() => setStatusIndex(1), 1500)
    const statusTimer2 = setTimeout(() => setStatusIndex(2), 3000)

    const completeTimer = setTimeout(async () => {
      const data = await fetchData()
      onComplete(data)
    }, 4500)

    return () => {
      clearTimeout(statusTimer1)
      clearTimeout(statusTimer2)
      clearTimeout(completeTimer)
    }
  }, [userData, scenario, onComplete])

  return (
    <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6">
      <div className="relative mb-12 h-64 w-64">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-cyan-500/30"
            style={{
              width: `${i * 25}%`,
              height: `${i * 25}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}

        <motion.div
          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 30px rgba(34,211,238,0.6), 0 0 60px rgba(34,211,238,0.3)" }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-32 w-0.5 origin-bottom bg-gradient-to-t from-cyan-500 to-transparent"
          style={{ transform: "translateX(-50%)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgba(34, 211, 238, 0.2) 45deg, transparent 90deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      <p className="text-xl font-medium text-white">{statusMessages[statusIndex]}</p>

      <div className="mt-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              i <= statusIndex ? "bg-cyan-400" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
