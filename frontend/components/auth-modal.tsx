"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Shield, Bluetooth } from "lucide-react"

interface AuthModalProps {
  userName: string
  onComplete: (email: string) => void
  onClose: () => void
}

export function AuthModal({ userName, onComplete, onClose }: AuthModalProps) {
  const [step, setStep] = useState<"signup" | "permission">("signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayText, setDisplayText] = useState("")

  const signupText = `I'm so excited to help you, ${userName}. To keep your health journey safe and private, may we create your profile?`
  const permissionText = `I'm ready to begin my scan. Shall we connect to your health data so I can see how you're doing?`

  const currentText = step === "signup" ? signupText : permissionText

  useEffect(() => {
    setDisplayText("")
    let index = 0
    const timer = setInterval(() => {
      if (index <= currentText.length) {
        setDisplayText(currentText.slice(0, index))
        index++
      } else {
        clearInterval(timer)
      }
    }, 30)
    return () => clearInterval(timer)
  }, [currentText])

  const handleSignup = () => {
    if (email && password) {
      setStep("permission")
    }
  }

  const handleConnect = () => {
    onComplete(email)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl"
        style={{
          boxShadow: "0 0 80px rgba(139,92,246,0.25), 0 0 160px rgba(59,130,246,0.15)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
          {step === "signup" ? (
            <Shield className="h-10 w-10 text-cyan-400" />
          ) : (
            <Bluetooth className="h-10 w-10 text-cyan-400" />
          )}
        </div>

        {/* Typewriter Text */}
        <p className="mb-8 min-h-[4rem] text-lg text-white/80">
          {displayText}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            className="ml-1 inline-block h-[0.8em] w-[2px] translate-y-0.5 bg-white/70"
          />
        </p>

        {step === "signup" ? (
          <div className="space-y-6">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full border-b-2 border-white/30 bg-transparent px-2 py-3 text-center text-lg text-white placeholder-white/40 outline-none transition-colors focus:border-cyan-400"
              />
            </div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border-b-2 border-white/30 bg-transparent px-2 py-3 text-center text-lg text-white placeholder-white/40 outline-none transition-colors focus:border-cyan-400"
              />
            </div>

            <button
              onClick={handleSignup}
              disabled={!email || !password}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 py-4 text-lg font-medium text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Profile
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 py-4 text-lg font-medium text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40"
          >
            Connect
          </button>
        )}
      </motion.div>
    </div>
  )
}
