"use client"

import { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { month: "Jan", income: 40, profit: 24 },
  { month: "Feb", income: 30, profit: 18 },
  { month: "Mar", income: 20, profit: 12 },
  { month: "Apr", income: 27, profit: 18 },
  { month: "May", income: 40, profit: 24 },
  { month: "Jun", income: 48, profit: 36 },
  { month: "Jul", income: 60, profit: 42 },
  { month: "Aug", income: 50, profit: 36 },
  { month: "Sep", income: 70, profit: 48 },
  { month: "Oct", income: 90, profit: 60 },
  { month: "Nov", income: 75, profit: 52 },
  { month: "Dec", income: 60, profit: 42 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-purple-600 text-sm">Income: ${payload[0].value}k</p>
        <p className="text-amber-500 text-sm">Profit: ${payload[1].value}k</p>
      </div>
    )
  }

  return null
}

export function DashboardChart() {
  const chartRef = useRef(null)
  const isInView = useInView(chartRef, { once: true, amount: 0.3 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={chartRef}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8 } },
      }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#888" }}
            tickFormatter={(value) => `${value}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--violet)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="income"
            stroke="var(--violet)"
            strokeWidth={3}
            dot={{ r: 0 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            animationDuration={2000}
            animationEasing="ease-in-out"
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#fbbf24"
            strokeWidth={3}
            dot={{ r: 0 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            animationDuration={2000}
            animationEasing="ease-in-out"
            animationBegin={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

