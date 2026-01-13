"use client"
import { motion } from "framer-motion"
import { X, User } from "lucide-react"
import type { UserData, ArchetypeProfile } from "@/app/page"

interface ProfileDrawerProps {
  userData: UserData
  profile: ArchetypeProfile
  onClose: () => void
  onArchetypeChange: (archetype: "current_user" | "athlete" | "average" | "recovery") => void
  currentArchetype: string
  demoMode: boolean
  onDemoModeChange: (enabled: boolean) => void
  initialUserName: string
  stressMod: number
  onStressModChange: (v: number) => void
  onApplyStress: () => void
}

export function ProfileDrawer({
  userData,
  profile,
  onClose,
  onArchetypeChange,
  currentArchetype,
  demoMode,
  onDemoModeChange,
  initialUserName,
  stressMod,
  onStressModChange,
  onApplyStress,
}: ProfileDrawerProps) {
  const archetypes = [
    {
    id: "current_user",
    label: "You",
    description: "Your current health baseline",
  },
    { id: "athlete", label: "Athlete", description: "High-performance training archetype" },
    { id: "average", label: "Average Joe", description: "Balanced lifestyle focus archetype" },
    {
      id: "recovery",
      label: "Sedentary",
      description: "Low activity baseline archetype",
    },
  ] as const

  const displayName = demoMode ? profile.name : initialUserName
  const shownProfile = demoMode
  ? profile
  : {
      name: initialUserName,
      age: userData.age ?? profile.age,
      gender: userData.gender ?? profile.gender,
      weight: userData.weight ?? profile.weight,
      height: userData.height ?? profile.height,
    }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto border-l border-white/10 bg-[#0f172a]/95 p-6 backdrop-blur-xl"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-white">Profile</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Avatar */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 ring-2 ring-cyan-400/50">
            <User className="h-12 w-12 text-cyan-400" />
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-white">{displayName}</h3>
          <p className="text-sm text-white/50">{userData.email || "user@example.com"}</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-semibold text-white">{shownProfile.age}</p>
            <p className="text-xs text-white/50">Age</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-semibold text-white">{shownProfile.gender}</p>
            <p className="text-xs text-white/50">Gender</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-semibold text-white">
              {shownProfile.weight} <span className="text-sm font-normal text-white/50">lbs</span>
            </p>
            <p className="text-xs text-white/50">Weight</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-2xl font-semibold text-white">
              {shownProfile.height} <span className="text-sm font-normal text-white/50">in</span>
            </p>
            <p className="text-xs text-white/50">Height</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
              <p className="font-medium text-white">Demo Mode</p>
              <p className="text-xs text-white/50">Switch between user scenarios</p>
            </div>
            <button
              onClick={() => onDemoModeChange(!demoMode)}
              className={`relative h-7 w-14 rounded-full transition-colors ${demoMode ? "bg-cyan-500" : "bg-white/20"}`}
            >
              <motion.div
                animate={{ x: demoMode ? 28 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
              />
            </button>
          </div>
        </div>

        {/* Archetype Switcher - only visible when demo mode is ON */}
        {demoMode && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Scenario Engine</p>
            <div className="space-y-2">
              {archetypes.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => onArchetypeChange(arch.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    currentArchetype === arch.id
                      ? "border-cyan-400 bg-cyan-500/20"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <p className={`font-medium ${currentArchetype === arch.id ? "text-cyan-300" : "text-white"}`}>
                    {arch.label}
                  </p>
                  <p className={`text-xs ${currentArchetype === arch.id ? "text-cyan-300/70" : "text-white/50"}`}>
                    {arch.description}
                  </p>
                </button>
              ))}
            </div>

            <p className="mt-6 mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
              Environmental Modifiers
            </p>
            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-white">Today’s Stress</p>
                <p className="text-xs text-white/60">{stressMod.toFixed(2)}×</p>
              </div>

              <input
                type="range"
                min={0.75}
                max={1.25}
                step={0.05}
                value={stressMod}
                onChange={(e) => onStressModChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />

              <div className="mt-2 flex justify-between text-xs text-white/50">
                <span>Calm</span>
                <span>Normal</span>
                <span>Stressed</span>
              </div>
            </div>

            <button
              onClick={onApplyStress}
              className="mt-3 w-full rounded-xl bg-cyan-500/90 px-4 py-2 text-sm font-medium text-black hover:bg-cyan-400"
            >
              Apply
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
}
