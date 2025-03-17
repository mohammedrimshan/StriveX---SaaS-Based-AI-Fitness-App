"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Users, Dumbbell, BarChart3, ArrowUpRight, ArrowDownRight, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Dashboard Chart Component Import
import { DashboardChart } from "./AdminComponents/DashboardChart"

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    revenue: 0,
    users: 0,
    trainers: 0,
    categories: 0,
    activeSessions: 0,
    progress: 0,
  })

  // Animate the numbers counting up on mount
  useEffect(() => {
    setMounted(true)

    const interval = setInterval(() => {
      setStats((prev) => {
        const newRevenue = prev.revenue + (15800 - prev.revenue) * 0.1
        const newUsers = prev.users + (1245 - prev.users) * 0.1
        const newTrainers = prev.trainers + (87 - prev.trainers) * 0.1
        const newCategories = prev.categories + (12 - prev.categories) * 0.1
        const newActiveSessions = prev.activeSessions + (28 - prev.activeSessions) * 0.1
        const newProgress = prev.progress + (100 - prev.progress) * 0.05

        if (
          Math.abs(newRevenue - 15800) < 0.1 &&
          Math.abs(newUsers - 1245) < 0.1 &&
          Math.abs(newTrainers - 87) < 0.1 &&
          Math.abs(newCategories - 12) < 0.1 &&
          Math.abs(newActiveSessions - 28) < 0.1 &&
          Math.abs(newProgress - 100) < 0.1
        ) {
          clearInterval(interval)
          return {
            revenue: 15800,
            users: 1245,
            trainers: 87,
            categories: 12,
            activeSessions: 28,
            progress: 100,
          }
        }

        return {
          revenue: newRevenue,
          users: Math.round(newUsers),
          trainers: Math.round(newTrainers),
          categories: Math.round(newCategories),
          activeSessions: Math.round(newActiveSessions),
          progress: newProgress,
        }
      })
    }, 30)

    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeInOut"
      }
    })
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen pt-16">
      {/* Added pt-16 to create space for the header */}
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mt-4">
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
                  <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center"
                    >
                      <ArrowUpRight className="w-3 h-3" /> 12.5%
                    </Badge>
                    <span className="ml-2">from last month</span>
                  </div>
                  <Progress value={stats.progress} className="h-1 mt-3 bg-indigo-100" indicatorClassName="bg-indigo-600" />
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
                  <div className="text-2xl font-bold">{stats.users.toLocaleString()}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center"
                    >
                      <ArrowUpRight className="w-3 h-3" /> 8.2%
                    </Badge>
                    <span className="ml-2">from last month</span>
                  </div>
                  <Progress value={stats.progress} className="h-1 mt-3 bg-blue-100" indicatorClassName="bg-blue-500" />
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
                  <div className="text-2xl font-bold">{stats.trainers}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center"
                    >
                      <ArrowUpRight className="w-3 h-3" /> 5.3%
                    </Badge>
                    <span className="ml-2">from last month</span>
                  </div>
                  <Progress
                    value={stats.progress}
                    className="h-1 mt-3 bg-purple-100"
                    indicatorClassName="bg-purple-500"
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
                  <div className="text-2xl font-bold">{stats.categories}</div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex gap-1 items-center">
                      <ArrowDownRight className="w-3 h-3" /> 2.1%
                    </Badge>
                    <span className="ml-2">from last month</span>
                  </div>
                  <Progress value={stats.progress} className="h-1 mt-3 bg-amber-100" indicatorClassName="bg-amber-500" />
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
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex gap-1 items-center">
                      <ArrowUpRight className="w-3 h-3" /> 8.7%
                    </Badge>
                    <span className="ml-2">from last week</span>
                  </div>
                  <Progress value={stats.progress} className="h-1 mt-3 bg-emerald-100" indicatorClassName="bg-emerald-500" />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Rest of the component remains unchanged */}
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
              <Select defaultValue="yearly">
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
                  <CardDescription>Financial performance over the past year</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="h-[350px] relative">
                    <motion.div 
                      className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-100 z-10"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1, duration: 0.3 }}
                    >
                      <div className="text-sm font-medium text-gray-500">Q3 Projects</div>
                      <div className="text-2xl font-bold">$77,000</div>
                    </motion.div>
                    <DashboardChart />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button variant="outline" size="sm">
                    Download Report
                  </Button>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">View Details</Button>
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
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    Member growth chart will appear here
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
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    Activity chart will appear here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-indigo-600" />
                  Top Performing Trainers
                </CardTitle>
                <CardDescription>Trainers with highest client satisfaction</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { name: "Alex Johnson", rating: 98, clients: 42, specialty: "Weight Training" },
                    { name: "Sarah Miller", rating: 96, clients: 38, specialty: "Yoga" },
                    { name: "David Chen", rating: 95, clients: 35, specialty: "HIIT" },
                    { name: "Maria Garcia", rating: 94, clients: 31, specialty: "Pilates" },
                  ].map((trainer, i) => (
                    <motion.div
                      key={trainer.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors border border-gray-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                          {trainer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="font-medium">{trainer.name}</div>
                          <div className="text-xs text-muted-foreground">{trainer.specialty}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{trainer.clients}</div>
                          <div className="text-xs text-muted-foreground">Clients</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">{trainer.rating}%</div>
                          <div className="text-xs text-muted-foreground">Rating</div>
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
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Popular Fitness Programs
                </CardTitle>
                <CardDescription>Most enrolled programs this month</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { name: "30-Day Transformation", enrolled: 128, category: "Weight Loss", growth: 24 },
                    { name: "Strength Mastery", enrolled: 96, category: "Muscle Building", growth: 18 },
                    { name: "Mindful Movement", enrolled: 87, category: "Yoga & Meditation", growth: 15 },
                    { name: "Cardio Blast", enrolled: 74, category: "Endurance", growth: -3 },
                  ].map((program, i) => (
                    <motion.div
                      key={program.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      whileHover={{ scale: 1.02, x: -5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-medium">{program.name}</div>
                          <div className="text-xs text-muted-foreground">{program.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{program.enrolled}</div>
                          <div className="text-xs text-muted-foreground">Enrolled</div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium flex items-center gap-1 ${program.growth > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {program.growth > 0 ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {Math.abs(program.growth)}%
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