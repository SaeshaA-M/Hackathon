"use client"

import { motion } from "framer-motion"
import { Zap } from "lucide-react"

interface BodyBatteryProps {
  value: number
  insightText: string
  isMobile?: boolean
}

export function BodyBattery({ value, insightText, isMobile = false }: BodyBatteryProps) {
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (value / 100) * circumference

  if (isMobile) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative h-40 w-40">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="url(#batteryGradientCosmic)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            />
            <defs>
              <linearGradient id="batteryGradientCosmic" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Zap className="mb-1 h-5 w-5 text-cyan-400" />
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-3xl font-bold text-transparent">
              {value}%
            </span>
            <span className="mt-1 text-xs text-white/50">Body Battery</span>
          </div>
        </div>
      </div>
    )
  }

  // Desktop layout with text
  return (
    <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:flex-row md:gap-8">
      <div className="relative h-40 w-40 shrink-0 lg:h-48 lg:w-48">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#batteryGradientCosmic)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
          <defs>
            <linearGradient id="batteryGradientCosmic" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Zap className="mb-1 h-6 w-6 text-cyan-400" />
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
            {value}%
          </span>
        </div>
      </div>

      <div className="flex-1 text-center md:text-left">
        <h3 className="mb-2 text-2xl font-semibold text-white">Body Battery</h3>
        <p className="text-lg text-cyan-300">
          {insightText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-0.5 bg-cyan-300"
          />
        </p>
        <div className="mt-4 flex items-center gap-3 md:justify-start justify-center">
          <div className="h-2 w-48 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
            />
          </div>
          <span className="text-sm font-medium text-white/60">Optimal</span>
        </div>
      </div>
    </div>
  )
}
