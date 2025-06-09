"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Activity, Users, Dumbbell, BarChart3, ArrowUpRight, ArrowDownRight, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard"
import { ITopTrainer, IPopularWorkout } from "@/types/AdminDashboard"
import { DashboardChart } from "./AdminComponents/DashboardChart"

export default function AdminDashboard() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [periodFilter, setPeriodFilter] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly")
  const {
    useDashboardStats,
    useTopTrainers,
    usePopularWorkouts,
    useUserAndSessionData,
    useDownloadRevenueReport,
    useDownloadSessionReport,
  } = useAdminDashboard()

  const { data: statsData, isLoading: statsLoading } = useDashboardStats({ year })
  console.log(statsData, "statsData")
  const { data: trainersData, isLoading: trainersLoading } = useTopTrainers({ limit: 5 })
  console.log(trainersData, "trainersData")
  const { data: workoutsData, isLoading: workoutsLoading } = usePopularWorkouts({ limit: 5 })
  console.log(workoutsData, "workoutsData")
  const { data: sessionData, isLoading: sessionLoading } = useUserAndSessionData({ 
    year, 
    type: periodFilter === "daily" ? "daily" : "weekly" 
  })
  console.log(sessionData, "sessionData")

  const revenueReportDownload = useDownloadRevenueReport()
  const sessionReportDownload = useDownloadSessionReport()

  // Use the raw data or fallback
  const stats = statsData || {
    totalRevenue: 0,
    totalUsers: 0,
    totalTrainers: 0,
    totalCategories: 0,
    activeSessions: 0,
    monthlyFinancials: [],
  }

  const trainers = trainersData || []
  console.log(trainers, "trainers")
  const workouts = workoutsData || []
  const session = sessionData || { monthlySignups: [], sessionOverview: [] }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeInOut",
      },
    }),
  }

  const handleDownloadReport = (type: "income" | "activity") => {
    if (type === "income") {
      revenueReportDownload.mutate({ year })
    } else {
      sessionReportDownload.mutate({ year })
    }
  }

  if (statsLoading || trainersLoading || workoutsLoading || sessionLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen pt-16">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-500">Welcome to StriveX Fitness Admin Dashboard</p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="lg:col-span-1"
            >
              <Card className="overflow-hidden border-l-4 border-l-indigo-600 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <Activity className="w-4 h-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      {stats.monthlyFinancials[0]?.totalIncome
                        ? ((stats.monthlyFinancials[0].totalIncome - (stats.monthlyFinancials[1]?.totalIncome || 0)) /
                            (stats.monthlyFinancials[1]?.totalIncome || 1) * 100).toFixed(1)
                        : 0}
                      %
                    </Badge>
                    <span className="ml-2">from last month</span>
                  </div>
                  <Progress
                    value={stats.totalRevenue ? (stats.totalRevenue / (stats.totalRevenue + 1)) * 100 : 0}
                    className="h-1 mt-3 bg-indigo-100 [&>div]:bg-indigo-600"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="lg:col-span-1"
            >
              <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="w-4 h-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      {session.monthlySignups[0]?.totalSignups
                        ? ((session.monthlySignups[0].totalSignups - (session.monthlySignups[1]?.totalSignups || 0)) /
                            (session.monthlySignups[1]?.totalSignups || 1) * 100).toFixed(1)
                        : 0}
                      %
                    </Badge>
                    <span className="ml-2">from last month</span>
                  </div>
                  <Progress
                    value={stats.totalUsers ? (stats.totalUsers / (stats.totalUsers + 1)) * 100 : 0}
                    className="h-1 mt-3 bg-blue-100 [&>div]:bg-blue-500"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="lg:col-span-1"
            >
              <Card className="overflow-hidden border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
                  <Dumbbell className="w-4 h-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTrainers}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      5.3%
                    </Badge>
                    <span className="ml-2">from last month</span>
                  </div>
                  <Progress
                    value={stats.totalTrainers ? (stats.totalTrainers / (stats.totalTrainers + 1)) * 100 : 0}
                    className="h-1 mt-3 bg-purple-100 [&>div]:bg-purple-500"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="lg:col-span-1"
            >
              <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                  <BarChart3 className="w-4 h-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCategories}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex gap-1 items-center">
                      <ArrowDownRight className="w-3 h-3" />
                      2.1%
                    </Badge>
                    <span className="ml-2">from last month</span>
                  </div>
                  <Progress
                    value={stats.totalCategories ? (stats.totalCategories / (stats.totalCategories + 1)) * 100 : 0}
                    className="h-1 mt-3 bg-amber-100 [&>div]:bg-amber-500"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className="lg:col-span-1"
            >
              <Card className="overflow-hidden border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSessions}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      {session.sessionOverview[0]?.totalSessions
                        ? ((session.sessionOverview[0].totalSessions - (session.sessionOverview[1]?.totalSessions || 0)) /
                            (session.sessionOverview[1]?.totalSessions || 1) * 100).toFixed(1)
                        : 0}
                      %
                    </Badge>
                    <span className="ml-2">from last week</span>
                  </div>
                  <Progress
                    value={stats.activeSessions ? (stats.activeSessions / (stats.activeSessions + 1)) * 100 : 0}
                    className="h-1 mt-3 bg-emerald-100 [&>div]:bg-emerald-500"
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
        >
          <Tabs defaultValue="income" className="w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <TabsList className="grid w-[400px] grid-cols-3">
                <TabsTrigger value="income">Income & Expense</TabsTrigger>
                <TabsTrigger value="members">Member Growth</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="border p-1 rounded w-24"
                  placeholder="Year"
                />
                <Select
                  value={periodFilter}
                  onValueChange={(value) => setPeriodFilter(value as "daily" | "weekly" | "monthly" | "yearly")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="income" className="space-y-4 p-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Financial Performance</CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                        <span className="text-sm text-muted-foreground">Income</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full bg-purple-500"></span>
                        <span className="text-sm text-muted-foreground">Expenses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                        <span className="text-sm text-muted-foreground">Profit</span>
                      </div>
                    </div>
                  </div>
                  <CardDescription>Financial performance over the selected period</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="h-[350px] relative">
                    <motion.div
                      className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-100 z-10"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1, duration: 0.3 }}
                    >
                      <div className="text-sm font-medium text-gray-500">Latest Month</div>
                      <div className="text-2xl font-bold">
                        ${stats.monthlyFinancials[0]?.totalIncome.toLocaleString() || 0}
                      </div>
                    </motion.div>
                    <DashboardChart data={stats.monthlyFinancials} tab="income" period={periodFilter} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport("income")}
                    disabled={revenueReportDownload.isPending}
                  >
                    {revenueReportDownload.isPending ? "Downloading..." : "Download Report"}
                  </Button>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle>Member Growth</CardTitle>
                  <CardDescription>New member registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <DashboardChart data={session.monthlySignups} tab="members" period={periodFilter} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="border-0 shadow-none">
                <CardHeader>
                  <CardTitle>Activity Overview</CardTitle>
                  <CardDescription>User engagement and platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <DashboardChart data={session.sessionOverview} tab="activity" period={periodFilter} />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport("activity")}
                    disabled={sessionReportDownload.isPending}
                  >
                    {sessionReportDownload.isPending ? "Downloading..." : "Download Report"}
                  </Button>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full overflow-hidden shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-indigo-600" />
                  Top Performing Trainers
                </CardTitle>
                <CardDescription>Trainers with highest client engagement</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {trainers.map((trainer: ITopTrainer, index: number) => (
                    <motion.div
                      key={trainer.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-indigo-100 transition-colors border border-gray-100"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                          {trainer.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="font-medium">{trainer.name}</div>
                          <div className="text-xs text-muted-foreground">{trainer.skills.join(", ")}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{trainer.totalClients}</div>
                          <div className="text-xs text-muted-foreground">Clients</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full overflow-hidden shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Popular Workouts
                </CardTitle>
                <CardDescription>Most enrolled programs this month</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {workouts.map((workout: IPopularWorkout, index: number) => (
                    <motion.div
                      key={workout.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-100 transition-colors border border-gray-100"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{workout.name}</div>
                          <div className="text-xs text-muted-foreground">{workout.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{workout.enrolledClients}</div>
                          <div className="text-xs text-muted-foreground">Enrolled Clients</div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium flex items-center gap-1 ${workout.growthPercentage > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {workout.growthPercentage > 0 ? (
                              <>
                                <ArrowUpRight className="w-3 h-3" />
                                {Math.abs(workout.growthPercentage).toFixed(2)}%
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="w-3 h-3" />
                                {Math.abs(workout.growthPercentage).toFixed(2)}%
                              </>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">Growth</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}