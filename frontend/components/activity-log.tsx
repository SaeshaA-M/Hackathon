"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ActivityLogProps {
  calendarData: { [date: string]: number }
}

export function ActivityLog({ calendarData }: ActivityLogProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    const nextMonth = new Date(year, month + 1, 1)
    const now = new Date()
    if (nextMonth <= now) {
      setCurrentDate(nextMonth)
    }
  }

  const getScoreColor = (score: number | undefined) => {
    if (score === undefined) return { bg: "bg-slate-800", ring: "ring-slate-700/50", text: "text-slate-500" }
    if (score < 40) return { bg: "bg-red-500", ring: "ring-red-400/50", text: "text-white" }
    if (score < 70) return { bg: "bg-amber-500", ring: "ring-amber-400/50", text: "text-white" }
    return { bg: "bg-emerald-500", ring: "ring-emerald-400/50", text: "text-white" }
  }

  // Build calendar grid
  const calendarDays: (number | null)[] = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }

  // Add actual days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d)
  }

  const isCurrentMonth = new Date().getMonth() === month && new Date().getFullYear() === year

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-semibold tracking-tight text-white">
          {monthNames[month]} {year}
        </h3>

        <button
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          className={`rounded-full p-2 transition-colors ${
            isCurrentMonth ? "cursor-not-allowed text-white/20" : "text-white/50 hover:bg-white/10 hover:text-white"
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-4 grid grid-cols-7 gap-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-white/40">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-12" />
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const score = calendarData[dateStr]
          const colors = getScoreColor(score)
          const isToday = new Date().toISOString().split("T")[0] === dateStr
          const isFuture = new Date(dateStr) > new Date()

          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01, duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform ${
                  isFuture ? "bg-slate-800/50" : colors.bg
                } ${isToday ? "ring-2 ring-cyan-400" : `ring-1 ${colors.ring}`} ${
                  !isFuture && score !== undefined ? "hover:scale-110 cursor-pointer" : ""
                }`}
                title={score !== undefined ? `Score: ${score}` : isFuture ? "Future" : "No data"}
              >
                {isFuture ? (
                  <span className="text-xs text-slate-600">{day}</span>
                ) : score !== undefined ? (
                  <span className={`text-xs font-semibold ${colors.text}`}>{day}</span>
                ) : (
                  <span className="text-xs text-slate-500">{day}</span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-800 ring-1 ring-slate-700/50" />
          <span>No data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span>{"< 40%"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <span>40-70%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span>{"> 70%"}</span>
        </div>
      </div>
    </div>
  )
}
