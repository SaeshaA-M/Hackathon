"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { ChevronDown } from "lucide-react"

interface InsightCardProps {
  card: {
    id: string
    title: string
    score: string
    icon: LucideIcon
    color: string
    details: string[]
    videoId?: string
    actions?: string[]
    sleepStagesMins?: { core: number; deep: number; rem: number }
  }
  index: number
  isExpanded: boolean
  onToggle: () => void
}

export function InsightCard({ card, index, isExpanded, onToggle }: InsightCardProps) {
  const Icon = card.icon
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [isExpanded, card.details.length, card.actions?.length])

  const focusTitle = card.id === "sleep" ? "Tonight’s Focus" : "Today’s Focus"
  const focusSubtitle =
    card.id === "sleep"
      ? "Simple actions to improve recovery."
      : "Recommended actions based on your current signals."

  const focusItems = (card.actions ?? []).filter(Boolean)

  const toEmbedUrl = (input?: string): string | null => {
  if (!input) return null

  // Already an embed url
  if (input.includes("youtube.com/embed/")) return input

  // youtu.be/<id>
  const short = input.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/)
  if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`

  // youtube.com/watch?v=<id>
  const watch = input.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)
  if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`

  // youtube.com/shorts/<id>
  const shorts = input.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/)
  if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}`

  // If it's not YouTube, we can't reliably embed it (often blocked)
  return null
}
  const embed = toEmbedUrl(card.videoId)


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
    >
      {/* Card Header */}
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-center justify-between p-6 transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-4">
          <div className="rounded-xl p-3" style={{ backgroundColor: `${card.color}20` }}>
            <Icon className="h-6 w-6" style={{ color: card.color }} />
          </div>
          <div>
            <h3 className="text-[clamp(1.1rem,2.5vw,1.4rem)] font-medium tracking-tight text-white">{card.title}</h3>
            <p className="text-sm text-white/50">Tap to explore more</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold tracking-tighter text-white">{card.score}</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-5 w-5 text-white/50" />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? contentHeight : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div ref={contentRef} className="border-t border-white/10">
          {card.id === "sleep" ? (
            // ===== Sleep Expanded: big focus + donut (no YouTube) =====
            <div className="flex flex-col gap-8 p-6">
              <div>
                <h4 className="text-[clamp(1.15rem,3.8vw,1.55rem)] font-semibold text-white">{focusTitle}</h4>
                <p className="mt-1 text-sm text-white/50">{focusSubtitle}</p>

                {focusItems.length > 0 ? (
                  <ul className="mt-5 space-y-4">
                    {focusItems.slice(0, 4).map((item, i) => (
                      <motion.li
                        key={`${item}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 * i, duration: 0.25 }}
                        className="flex items-start gap-4 text-[clamp(1rem,3.4vw,1.2rem)] leading-[1.35] text-white/90"

                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.08 * i, type: "spring", stiffness: 320 }}
                          className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${card.color}25`, color: card.color }}
                        >
                          <span className="text-[13px] leading-none translate-y-[0.5px]">✓</span>
                        </motion.div>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-white/50">
                    No specific sleep recommendations right now — keep your routine steady.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white/70">Sleep Stages</h4>
                  <span className="text-xs text-white/40">Today</span>
                </div>

                <div className="flex justify-center">
                  <SleepDonut color={card.color} stages={card.sleepStagesMins} />
                </div>
              </div>
            </div>
          ) : (
            // ===== Activity / Mind Expanded: big focus + optional YouTube =====
            <div className="flex flex-col gap-6 p-6 lg:flex-row">
              <div className="flex-1">
                <h4 className="text-[clamp(1.15rem,3.8vw,1.55rem)] font-semibold text-white">{focusTitle}</h4>
                <p className="mt-1 text-sm text-white/50">{focusSubtitle}</p>

                {focusItems.length > 0 ? (
                  <ul className="mt-5 space-y-4">
                    {focusItems.slice(0, 5).map((item, i) => (
                      <motion.li
                        key={`${item}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.06 * i, duration: 0.25 }}
                        className="flex items-start gap-3 text-[clamp(1rem,3.4vw,1.2rem)] leading-snug text-white/90"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.08 * i, type: "spring", stiffness: 320 }}
                          className="mt-1 flex h-7 w-7 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${card.color}25`, color: card.color }}
                        >
                          <span className="text-[14px] leading-none">✓</span>
                        </motion.div>
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-white/50">
                    No specific recommendations right now — keep your routine steady.
                  </p>
                )}
              </div>

              {card.videoId && (
                <div className="aspect-video w-full overflow-hidden rounded-xl lg:w-72">
                  <iframe
                    src={embed}
                    title={card.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function SleepDonut({
  stages,
  color,
}: {
  stages?: { core: number; deep: number; rem: number }
  color: string
}) {
  const core = Math.max(0, stages?.core ?? 0)
  const deep = Math.max(0, stages?.deep ?? 0)
  const rem = Math.max(0, stages?.rem ?? 0)

  const total = Math.max(1, core + deep + rem)
  const pctDeep = deep / total
  const pctRem = rem / total
  const pctCore = core / total

  // Big + thick donut
  const size = 172
  const stroke = 18
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r

  const segDeep = pctDeep * c
  const segRem = pctRem * c
  const segCore = pctCore * c

  // Distinct but still night-mode
  const deepColor = color
  const remColor = "rgba(168, 85, 247, 0.95)" // violet
  const coreColor = "rgba(34, 211, 238, 0.7)" // cyan
  const trackColor = "rgba(255,255,255,0.10)"

  // Center label: total sleep (hrs/min)
  const totalMins = core + deep + rem
  const hrs = Math.floor(totalMins / 60)
  const mins = Math.round(totalMins % 60)
  const totalLabel = `${hrs}h ${mins}m`

  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size / 2},${size / 2})`}>
          <circle r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />

          <circle
            r={r}
            fill="none"
            stroke={deepColor}
            strokeWidth={stroke}
            strokeDasharray={`${segDeep} ${c - segDeep}`}
            strokeDashoffset={0}
            transform="rotate(-90)"
            strokeLinecap="round"
          />

          <circle
            r={r}
            fill="none"
            stroke={remColor}
            strokeWidth={stroke}
            strokeDasharray={`${segRem} ${c - segRem}`}
            strokeDashoffset={-segDeep}
            transform="rotate(-90)"
            strokeLinecap="round"
            opacity={0.95}
          />

          <circle
            r={r}
            fill="none"
            stroke={coreColor}
            strokeWidth={stroke}
            strokeDasharray={`${segCore} ${c - segCore}`}
            strokeDashoffset={-(segDeep + segRem)}
            transform="rotate(-90)"
            strokeLinecap="round"
            opacity={0.95}
          />

          <text
            x="0"
            y="-4"
            textAnchor="middle"
            fontSize="22"
            fontWeight="700"
            fill="rgba(255,255,255,0.92)"
          >
            {totalLabel}
          </text>
          <text
            x="0"
            y="18"
            textAnchor="middle"
            fontSize="11"
            fontWeight="500"
            fill="rgba(255,255,255,0.55)"
          >
            Total Sleep
          </text>
        </g>
      </svg>


      <div className="text-xs text-white/60 space-y-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: deepColor }} />
          <span>Deep: {Math.round(pctDeep * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: remColor }} />
          <span>REM: {Math.round(pctRem * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: coreColor }} />
          <span>Core: {Math.round(pctCore * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
