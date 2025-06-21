"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ClientList from "./UserList/ClientList"
import ClientGrid from "./UserList/ClientGrid"
import { useTrainerBackupClients } from "@/hooks/backuptrainer/useTrainerBackupClients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMediaQuery } from "react-responsive"
import {
  Search,
  Grid3X3,
  List,
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Activity,
  Flame,
  StretchVerticalIcon as Stretch,
  Scale,
  Shield,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const BackupClients: React.FC = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [fitnessGoalFilter, setFitnessGoalFilter] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const limit = 10

  const { data, isLoading, isError, error } = useTrainerBackupClients(page, limit)

  const clients = data?.clients || []
  const totalPages = data?.totalPages || 1
  const currentPage = data?.currentPage || 1
  const totalClients = data?.totalClients || 0

  const isMobile = useMediaQuery({ maxWidth: 768 })

  useEffect(() => {
    if (isMobile) {
      setViewMode("grid")
    }
  }, [isMobile])

  const filteredClients = clients.filter((client: any) => {
    const matchesSearch =
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase())
    const matchesFitnessGoal = fitnessGoalFilter ? client.fitnessGoal === fitnessGoalFilter : true
    return matchesSearch && matchesFitnessGoal
  })

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1)
  }

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case "weightLoss":
        return <Scale className="w-4 h-4" />
      case "muscleGain":
        return <Dumbbell className="w-4 h-4" />
      case "endurance":
        return <Activity className="w-4 h-4" />
      case "flexibility":
        return <Stretch className="w-4 h-4" />
      case "maintenance":
        return <Flame className="w-4 h-4" />
      default:
        return <Dumbbell className="w-4 h-4" />
    }
  }

  return (
    <div>
      {/* Search and Filter */}
      <motion.div
        className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 p-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <Select onValueChange={setFitnessGoalFilter} value={fitnessGoalFilter}>
            <SelectTrigger className="w-full sm:w-48 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200">
              <SelectValue placeholder="Filter by Goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Goals</SelectItem>
              <SelectItem value="weightLoss">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-rose-500" />
                  <span>Weight Loss</span>
                </div>
              </SelectItem>
              <SelectItem value="muscleGain">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-blue-500" />
                  <span>Muscle Gain</span>
                </div>
              </SelectItem>
              <SelectItem value="endurance">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span>Endurance</span>
                </div>
              </SelectItem>
              <SelectItem value="flexibility">
                <div className="flex items-center gap-2">
                  <Stretch className="w-4 h-4 text-amber-500" />
                  <span>Flexibility</span>
                </div>
              </SelectItem>
              <SelectItem value="maintenance">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-teal-500" />
                  <span>Maintenance</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {!isMobile && (
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`rounded-md ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow-sm" : ""}`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`rounded-md ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow-sm" : ""}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {fitnessGoalFilter && (
          <motion.div
            className="mt-3 flex items-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Badge
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors cursor-pointer"
              onClick={() => setFitnessGoalFilter("")}
            >
              {getGoalIcon(fitnessGoalFilter)}
              <span>
                {fitnessGoalFilter === "weightLoss" && "Weight Loss"}
                {fitnessGoalFilter === "muscleGain" && "Muscle Gain"}
                {fitnessGoalFilter === "endurance" && "Endurance"}
                {fitnessGoalFilter === "flexibility" && "Flexibility"}
                {fitnessGoalFilter === "maintenance" && "Maintenance"}
              </span>
              <span className="ml-1">×</span>
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-20 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <div className="animate-pulse flex items-center h-full px-6">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
                <div className="ml-4 flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <motion.div
          className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-red-600 dark:text-red-400 font-medium">
            Error: {error?.message || "Failed to fetch backup clients"}
          </p>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredClients.length === 0 && (
        <motion.div
          className="text-center p-12 bg-white dark:bg-gray-800 rounded-xl shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <Shield className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No backup clients found</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </motion.div>
      )}

      {/* Client List */}
      {!isLoading && !isError && filteredClients.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <motion.div
            className="text-center mb-6 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-xl shadow-md"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="font-semibold">
              Supporting {filteredClients.length} Backup Client{filteredClients.length !== 1 ? "s" : ""}!
            </span>{" "}
            Ready to assist when needed!
          </motion.div>

          <AnimatePresence mode="wait">
            {viewMode === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ClientList clients={filteredClients} />
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ClientGrid clients={filteredClients} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="mt-8 flex justify-center items-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 shadow-sm"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            <span className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              Page {currentPage} of {totalPages} ({totalClients} Backup Clients)
            </span>
            <Button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-all duration-200 shadow-sm"
              size="sm"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default BackupClients
