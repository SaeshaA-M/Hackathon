"use client"

import { motion } from "framer-motion"
import { Heart, Flame, Moon } from "lucide-react"

interface VitalsStripProps {
  vitals: {
    heartRate: number
    hrv: number
    steps: number
    calories: number
  }
  sleepHours?: number
}

export function VitalsStrip({ vitals, sleepHours = 7.5 }: VitalsStripProps) {
  const pulseDuration = 60 / vitals.heartRate

  const vitalItems = [
    {
      icon: Heart,
      label: "Heart Rate",
      value: vitals.heartRate.toString(),
      unit: "BPM",
      color: "#ef4444",
      hasPulse: true,
    },
    {
      icon: Flame,
      label: "Calories",
      value: vitals.calories.toString(),
      unit: "kcal",
      color: "#f97316",
      hasPulse: false,
    },
    {
      icon: Moon,
      label: "Sleep",
      value: sleepHours.toFixed(1),
      unit: "hrs",
      color: "#3b82f6",
      hasPulse: false,
    },
  ]

  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-3 md:gap-4">
      {vitalItems.map((vital) => (
        <motion.div
          key={vital.label}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-xl md:gap-3 md:px-5 md:py-3"
        >
          <div className="relative">
            {vital.hasPulse ? (
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                }}
                transition={{
                  duration: pulseDuration,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <vital.icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: vital.color }} />
              </motion.div>
            ) : (
              <vital.icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: vital.color }} />
            )}
            {vital.hasPulse && (
              <motion.div
                className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 md:h-2.5 md:w-2.5"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: pulseDuration,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                style={{
                  boxShadow: "0 0 8px rgba(239,68,68,0.8)",
                }}
              />
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-semibold text-white md:text-lg">{vital.value}</span>
            {vital.unit && <span className="text-[10px] text-white/50 md:text-xs">{vital.unit}</span>}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
