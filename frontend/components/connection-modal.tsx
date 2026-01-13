"use client"

import { motion } from "framer-motion"
import { Bluetooth, X } from "lucide-react"

interface ConnectionModalProps {
  onAccept: () => void
  onClose: () => void
}

export function ConnectionModal({ onAccept, onClose }: ConnectionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl"
        style={{
          boxShadow: "0 0 60px rgba(139,92,246,0.2), 0 0 120px rgba(59,130,246,0.1)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
          <Bluetooth className="h-10 w-10 text-cyan-400" />
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-white">Connect Your Device</h2>
        <p className="mb-8 text-white/60">{"May I connect to your device's health monitoring data?"}</p>

        <button
          onClick={onAccept}
          className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 py-4 text-lg font-medium text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40"
        >
          Connect
        </button>
      </motion.div>
    </div>
  )
}
