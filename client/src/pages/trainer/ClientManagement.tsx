"use client"

import { useState } from "react"
import { Users, UserCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ClientRequestsTable from "./ClientRequestManagement"
import TrainerClientInvitation from "@/components/BackupTrainer/TrainerClientInvitation"
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund"
import AnimatedTitle from "@/components/Animation/AnimatedTitle"

export default function TrainerClientTabs() {
  const [activeTab, setActiveTab] = useState<"requests" | "invitations">("requests")

  const tabs = [
    {
      id: "requests" as const,
      label: "Client Requests",
      icon: Users,
      component: ClientRequestsTable,
      color: "from-blue-500 to-purple-600",
      iconColor: "text-blue-500",
    },
    {
      id: "invitations" as const,
      label: "Trainer Invitations", 
      icon: UserCheck,
      component: TrainerClientInvitation,
      color: "from-emerald-500 to-teal-600",
      iconColor: "text-emerald-500",
    },
  ]

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component

  return (
    <AnimatedBackground>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
          {/* Animated Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 lg:mb-12"
          >
            <AnimatedTitle 
              title="Client Request Management"
              subtitle="Manage your client relationships and grow your fitness community"
            />
          </motion.div>

          {/* Enhanced Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8 lg:mb-12"
          >
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-2 border border-white/20 max-w-lg w-full">
                <div className="grid grid-cols-2 gap-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: isActive ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          relative overflow-hidden rounded-xl p-4 transition-all duration-300
                          ${
                            isActive
                              ? `bg-gradient-to-r ${tab.color} text-white shadow-xl`
                              : `bg-gray-50/50 text-gray-600 hover:bg-white/60 hover:text-gray-800 hover:shadow-lg`
                          }
                        `}
                      >
                        {/* Background Animation */}
                        {isActive && (
                          <motion.div
                            layoutId="activeTabBackground"
                            className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}

                        <div className="relative z-10 flex items-center justify-center gap-3">
                          <Icon 
                            size={20} 
                            className={isActive ? 'text-white' : tab.iconColor}
                          />
                          <span className="font-medium text-sm sm:text-base">
                            {tab.label}
                          </span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Content with Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative"
          >
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 lg:p-8"
                >
                  {ActiveComponent && <ActiveComponent />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  )
}