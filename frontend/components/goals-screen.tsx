"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, TrendingUp, Zap, Check } from "lucide-react"

interface GoalsScreenProps {
  userName: string
  onComplete: (goals: string[]) => void
}

const goals = [
  {
    id: "habits",
    title: "Optimize Habits",
    description: "Build better health routines.",
    icon: Sparkles,
    glowColor: "#10b981", // Emerald
    bgColor: "rgba(16, 185, 129, 0.2)",
  },
  {
    id: "trends",
    title: "Visualize Trends",
    description: "Deep dive into your biometric history.",
    icon: TrendingUp,
    glowColor: "#8b5cf6", // Purple
    bgColor: "rgba(139, 92, 246, 0.2)",
  },
  {
    id: "performance",
    title: "Peak Performance",
    description: "Push your limits with high-strain targets.",
    icon: Zap,
    glowColor: "#06b6d4", // Cyan
    bgColor: "rgba(6, 182, 212, 0.2)",
  },
]

export function GoalsScreen({ userName, onComplete }: GoalsScreenProps) {
  const [displayText, setDisplayText] = useState("")
  const [showCards, setShowCards] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const greeting = `Wonderful to meet you, ${userName}. How can I help you feel your best?`

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index <= greeting.length) {
        setDisplayText(greeting.slice(0, index))
        index++
      } else {
        clearInterval(timer)
        setTimeout(() => setShowCards(true), 500)
      }
    }, 40)
    return () => clearInterval(timer)
  }, [greeting])

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  return (
    <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl text-center">
        <h1 className="mb-16 font-sans text-[clamp(1.5rem,5vw,3rem)] font-light tracking-tighter text-white">
          {displayText}
          {!showCards && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              className="ml-1 inline-block h-[0.8em] w-[3px] translate-y-1 bg-white"
            />
          )}
        </h1>

        {/* Goal Cards with individual glow colors */}
        {showCards && (
          <div className="mx-auto mb-12 grid max-w-3xl gap-6 md:grid-cols-3">
            {goals.map((goal, index) => {
              const Icon = goal.icon
              const isSelected = selectedGoals.includes(goal.id)

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  onClick={() => toggleGoal(goal.id)}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-6 backdrop-blur-xl transition-all duration-300 ${
                    isSelected
                      ? "border-white/40"
                      : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: goal.bgColor,
                          borderColor: goal.glowColor,
                          boxShadow: `0 0 40px ${goal.glowColor}40, inset 0 0 30px ${goal.glowColor}15`,
                        }
                      : {}
                  }
                >
                  {isSelected && (
                    <div
                      className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: goal.glowColor }}
                    >
                      <Check className="h-4 w-4 text-[#0f172a]" />
                    </div>
                  )}

                  <div
                    className={`mb-4 inline-flex rounded-xl p-3 ${isSelected ? "" : "bg-white/10"}`}
                    style={isSelected ? { backgroundColor: `${goal.glowColor}30` } : {}}
                  >
                    <Icon
                      className="h-6 w-6"
                      style={{ color: isSelected ? goal.glowColor : "rgba(255,255,255,0.7)" }}
                    />
                  </div>

                  <h3
                    className="mb-2 text-[clamp(1.1rem,2.5vw,1.3rem)] font-semibold"
                    style={{ color: isSelected ? goal.glowColor : "white" }}
                  >
                    {goal.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: isSelected ? `${goal.glowColor}99` : "rgba(255,255,255,0.5)" }}
                  >
                    {goal.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Continue Button */}
        {showCards && selectedGoals.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => onComplete(selectedGoals)}
            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-10 py-4 text-lg font-medium text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40"
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  )
}
