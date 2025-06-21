"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield } from "lucide-react"
import MyClients from "./MyClients"
import BackupClients from "./BackUpClients"

const ClientTabs: React.FC = () => {
  return (
    <div className="min-h-screen py-10 bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 mt-15">
      <div className="container mx-auto px-4">
        {/* Common Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-block mb-4 p-2 rounded-full bg-gradient-to-r from-purple-100 to-orange-100 dark:from-purple-900/30 dark:to-orange-900/30"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          >
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </motion.div>
          <motion.h1
            className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Client Management Dashboard
          </motion.h1>
          <motion.p
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Manage your primary clients and backup assignments all in one place. Switch between tabs to view different
            client categories.
          </motion.p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Tabs defaultValue="my-clients" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-1">
              <TabsTrigger
                value="my-clients"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">My Clients</span>
              </TabsTrigger>
              <TabsTrigger
                value="backup-clients"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Shield className="w-4 h-4" />
                <span className="font-medium">Backup Clients</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-clients" className="mt-0">
              <MyClients />
            </TabsContent>

            <TabsContent value="backup-clients" className="mt-0">
              <BackupClients />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default ClientTabs
