"use client"

import type React from "react"
import type { LucideIcon } from "lucide-react"

interface StatisticCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: "green" | "blue" | "purple" | "orange"
  delay?: number
}

const colorClasses = {
  green: {
    text: "text-emerald-600",
    bg: "bg-emerald-100",
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/25",
  },
  blue: {
    text: "text-blue-600",
    bg: "bg-blue-100",
    gradient: "from-blue-400 to-cyan-500",
    shadow: "shadow-blue-500/25",
  },
  purple: {
    text: "text-purple-600",
    bg: "bg-purple-100",
    gradient: "from-purple-400 to-pink-500",
    shadow: "shadow-purple-500/25",
  },
  orange: {
    text: "text-orange-600",
    bg: "bg-orange-100",
    gradient: "from-orange-400 to-red-500",
    shadow: "shadow-orange-500/25",
  },
}

export const StatisticCard: React.FC<StatisticCardProps> = ({ title, value, icon: Icon, color, delay = 0 }) => {
  const colors = colorClasses[color]

  return (
    <div
      className={`group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 transform transition-all duration-500 hover:scale-105 hover:shadow-xl ${colors.shadow} border border-white/20 hover:border-white/40 relative overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">{title}</p>
          <p
            className={`text-2xl font-bold ${colors.text} group-hover:scale-110 transition-transform duration-300 origin-left`}
          >
            {value}
          </p>
        </div>
        <div
          className={`p-3 bg-gradient-to-r ${colors.gradient} rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-12 group-hover:scale-110`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Progress Bar Animation */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
    </div>
  )
}