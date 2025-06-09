
"use client"

import { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "framer-motion"
import { LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Line } from "recharts"
import { IMonthlyFinancials, IMonthlySignups, ISessionOverview } from "@/types/AdminDashboard"

interface DashboardChartProps {
  data: IMonthlyFinancials[] | IMonthlySignups[] | ISessionOverview[];
  tab: "income" | "members" | "activity";
  period: "daily" | "weekly" | "monthly" | "yearly";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-md">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className={`text-sm ${entry.stroke}`}>
            {entry.name}: {entry.value}{entry.unit || ""}
          </p>
        ))}
      </div>
    )
  }
  return null;
}

export function DashboardChart({ data, tab }: DashboardChartProps) {
  const chartRef = useRef(null)
  const isInView = useInView(chartRef, { once: true, amount: 0.3 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  const getChartData = () => {
    if (tab === "income") {
      return (data as IMonthlyFinancials[]).map(item => ({
        label: item.month,
        income: item.totalIncome / 1000, // Scale to thousands
        profit: item.profit / 1000,
      }))
    } else if (tab === "members") {
      return (data as IMonthlySignups[]).map(item => ({
        label: item.month,
        signups: item.totalSignups,
      }))
    } else {
      return (data as ISessionOverview[]).map(item => ({
        label: item.period,
        sessions: item.totalSessions,
      }))
    }
  }

  const chartData = getChartData()

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
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "#888" }} 
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#888" }}
            tickFormatter={(value) => tab === "income" ? `${value}k` : value}
          />
          <Tooltip content={<CustomTooltip />} />
          <defs>
            {tab === "income" && (
              <>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </>
            )}
          </defs>
          {tab === "income" ? (
            <>
              <Line
                type="monotone"
                dataKey="income"
                name="Income ($k)"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Profit ($k)"
                stroke="#fbbf24"
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                animationDuration={2000}
                animationEasing="ease-in-out"
                animationBegin={300}
              />
            </>
          ) : tab === "members" ? (
            <Line
              type="monotone"
              dataKey="signups"
              name="Signups"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          ) : (
            <Line
              type="monotone"
              dataKey="sessions"
              name="Sessions"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              animationDuration={2000}
              animationEasing="ease-in-out"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}