"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface OnboardingScreenProps {
  onComplete: (name: string) => void
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [name, setName] = useState("")
  const [phase, setPhase] = useState<"line1" | "line2" | "input">("line1")
  const [displayText1, setDisplayText1] = useState("")
  const [displayText2, setDisplayText2] = useState("")

  const line1 = "Hello. I am Baymax, your personal health companion."
  const line2 = "What is your name?"

  // Phase 1: Type line 1
  useEffect(() => {
    if (phase !== "line1") return
    let index = 0
    const timer = setInterval(() => {
      if (index <= line1.length) {
        setDisplayText1(line1.slice(0, index))
        index++
      } else {
        clearInterval(timer)
        setTimeout(() => setPhase("line2"), 800)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [phase])

  // Phase 2: Type line 2
  useEffect(() => {
    if (phase !== "line2") return
    let index = 0
    const timer = setInterval(() => {
      if (index <= line2.length) {
        setDisplayText2(line2.slice(0, index))
        index++
      } else {
        clearInterval(timer)
        setTimeout(() => setPhase("input"), 500)
      }
    }, 50)
    return () => clearInterval(timer)
  }, [phase])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      onComplete(name.trim())
    }
  }

  return (
    <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6">
      <div className="w-full max-w-4xl text-center">
        {/* Line 1 */}
        <h1 className="mb-6 font-sans text-4xl font-light tracking-tight text-white md:text-6xl lg:text-7xl">
          {displayText1}
          {phase === "line1" && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              className="ml-1 inline-block h-[0.8em] w-[3px] translate-y-1 bg-white"
            />
          )}
        </h1>

        {/* Line 2 */}
        {(phase === "line2" || phase === "input") && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-16 text-xl text-white/70 md:text-2xl"
          >
            {displayText2}
            {phase === "line2" && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                className="ml-1 inline-block h-[0.7em] w-[2px] translate-y-0.5 bg-white/70"
              />
            )}
          </motion.p>
        )}

        {/* Input - fades in after line 2 completes */}
        {phase === "input" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="relative mx-auto max-w-2xl">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                placeholder="Type your name..."
                className="w-full border-none bg-transparent text-center font-sans text-4xl font-light text-white placeholder:text-white/20 focus:outline-none md:text-5xl lg:text-6xl"
              />
              <div
                className="mx-auto mt-4 h-[2px] w-full max-w-md bg-white"
                style={{
                  boxShadow: "0 0 30px rgba(255,255,255,0.6), 0 0 60px rgba(255,255,255,0.4)",
                }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-white/30"
            >
              Press <span className="rounded border border-white/20 px-2 py-0.5 font-mono text-white/50">Enter</span> to
              continue
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
