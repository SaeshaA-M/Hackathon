"use client"

import { motion } from "framer-motion"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import type { HealthData } from "@/app/page"

type SeriesPoint = { day: string; value: number }

interface TrendsPanelProps {
  healthData: HealthData
}

export function TrendsPanel({ healthData }: TrendsPanelProps) {
  const safeArray = (arr: SeriesPoint[] | undefined): SeriesPoint[] => arr ?? []

  const charts: Array<{
    id: string
    title: string
    description: string
    data: SeriesPoint[]
    color: string
    unit: string
    domain: [number, number]
    avgDecimals?: number
  }> = [
    {
      id: "heartRate",
      title: "Resting Heart Rate",
      description: "Your resting heart rate over the past 14 days. Lower often indicates better recovery.",
      data: healthData.heartRate ?? [],
      color: "#ef4444",
      unit: "BPM",
      domain: [40, 110] as [number, number],
    },
    {
      id: "calories",
      title: "Calories Burned",
      description: "Daily energy expenditure. Higher on workout days.",
      data: healthData.calories ?? [],
      color: "#f97316",
      unit: "kcal",
      domain: [0, 900] as [number, number],
    },
    {
      id: "sleep",
      title: "Sleep Duration",
      description: "Your sleep over the past 14 days. Aim for 7–9 hours.",
      data: healthData.sleep ?? [],
      color: "#3b82f6",
      unit: "hours",
      domain: [0, 10] as [number, number],
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {charts.map((chart, index) => {
        const n = chart.data.length
        const avg = n ? chart.data.reduce((sum, d) => sum + d.value, 0) / n : 0

        return (
          <motion.div
            key={chart.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <h3 className="mb-1 text-lg font-semibold text-white">{chart.title}</h3>
            <p className="mb-4 text-xs text-white/50">{chart.description}</p>

            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart.data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`gradient-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chart.color} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={chart.color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }}
                    tickFormatter={(value: string) => value.replace("Day ", "")}
                  />
                  <YAxis
                    domain={chart.domain}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}
                    itemStyle={{ color: "white", fontSize: 12 }}
                    formatter={(value: number) => {
                      const decimals = chart.avgDecimals ?? 1
                      return [`${value.toFixed(decimals)} ${chart.unit}`, chart.title]
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chart.color}
                    strokeWidth={2}
                    fill={`url(#gradient-${chart.id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <div>
                <p className="text-[10px] text-white/40">14-Day Average</p>
                <p className="text-lg font-semibold text-white">
                  {avg.toFixed(chart.avgDecimals ?? 1)}{" "}
                  <span className="text-xs font-normal text-white/50">{chart.unit}</span>
                </p>
              </div>
              <div className="h-8 w-8 rounded-full" style={{ backgroundColor: `${chart.color}30` }}>
                <div className="ml-1.5 mt-1.5 h-5 w-5 rounded-full" style={{ backgroundColor: chart.color }} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
