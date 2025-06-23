"use client"

import type React from "react"
import type { WalletRecord } from "@/types/wallet"
import { formatCurrency, formatDateTime } from "@/utils/dateUtils"
import { User, TrendingUp, Calendar } from "lucide-react"

interface WalletMobileCardsProps {
  data: WalletRecord[]
}

export const WalletMobileCards: React.FC<WalletMobileCardsProps> = ({ data }) => {
  return (
    <div className="lg:hidden">
      {data.map((record, index) => (
        <div
          key={record.id}
          className="p-6 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group relative overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <User className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                  {record.clientName}
                </h3>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                {record.planTitle}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">

              <div className="bg-white/80 rounded-2xl p-4 border border-gray-100 group-hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600 font-medium">Your Earnings</span>
                </div>
                <p className="font-bold text-blue-600 text-lg">{formatCurrency(record.trainerAmount)}</p>
              </div>

              <div className="bg-white/80 rounded-2xl p-4 border border-gray-100 group-hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-600 font-medium">Commission</span>
                </div>
                <p className="font-bold text-purple-600 text-lg">{formatCurrency(record.adminShare)}</p>
              </div>

              <div className="bg-white/80 rounded-2xl p-4 border border-gray-100 group-hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 font-medium">Date</span>
                </div>
                <p className="text-gray-800 font-semibold">{formatDateTime(record.completedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
