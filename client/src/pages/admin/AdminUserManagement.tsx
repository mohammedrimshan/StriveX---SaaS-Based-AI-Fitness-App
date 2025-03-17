"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, ChevronLeft, ChevronRight, UserCheck, UserX, SpaceIcon as Yoga, Dumbbell, Brain, Heart, MonitorIcon as Running, RefreshCw, Download, CheckCircle2, XCircle, UsersIcon, Mail, Phone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Pagination } from "@/components/common/Pagination/Pagination"
import { UserFilters } from "./AdminComponents/UserFilter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

// Define specialization types and their icons
const specializationIcons = {
  "Yoga": Yoga,
  "Meditation": Brain,
  "Workout": Dumbbell,
  "Cardio": Heart,
  "Running": Running
}

// Sample user data
const allUsers = [
  { id: "123", name: "John Smith", email: "john.smith@example.com", phone: "+1 (555) 123-4567", avatar: "/placeholder.svg?height=40&width=40", specialization: "Yoga", status: "Inactive" },
  { id: "124", name: "Emma Johnson", email: "emma.j@example.com", phone: "+1 (555) 234-5678", avatar: "/placeholder.svg?height=40&width=40", specialization: "Meditation", status: "Active" },
  { id: "125", name: "Michael Brown", email: "michael.b@example.com", phone: "+1 (555) 345-6789", avatar: "/placeholder.svg?height=40&width=40", specialization: "Workout", status: "Inactive" },
  { id: "126", name: "Olivia Davis", email: "olivia.d@example.com", phone: "+1 (555) 456-7890", avatar: "/placeholder.svg?height=40&width=40", specialization: "Yoga", status: "Active" },
  { id: "127", name: "William Wilson", email: "william.w@example.com", phone: "+1 (555) 567-8901", avatar: "/placeholder.svg?height=40&width=40", specialization: "Meditation", status: "Inactive" },
  { id: "128", name: "Sophia Martinez", email: "sophia.m@example.com", phone: "+1 (555) 678-9012", avatar: "/placeholder.svg?height=40&width=40", specialization: "Cardio", status: "Active" },
  { id: "129", name: "James Anderson", email: "james.a@example.com", phone: "+1 (555) 789-0123", avatar: "/placeholder.svg?height=40&width=40", specialization: "Running", status: "Inactive" },
  { id: "130", name: "Charlotte Thomas", email: "charlotte.t@example.com", phone: "+1 (555) 890-1234", avatar: "/placeholder.svg?height=40&width=40", specialization: "Yoga", status: "Active" },
  { id: "131", name: "Benjamin Jackson", email: "benjamin.j@example.com", phone: "+1 (555) 901-2345", avatar: "/placeholder.svg?height=40&width=40", specialization: "Workout", status: "Inactive" },
  { id: "132", name: "Amelia White", email: "amelia.w@example.com", phone: "+1 (555) 012-3456", avatar: "/placeholder.svg?height=40&width=40", specialization: "Meditation", status: "Active" },
  { id: "133", name: "Lucas Harris", email: "lucas.h@example.com", phone: "+1 (555) 123-4567", avatar: "/placeholder.svg?height=40&width=40", specialization: "Running", status: "Inactive" },
  { id: "134", name: "Mia Clark", email: "mia.c@example.com", phone: "+1 (555) 234-5678", avatar: "/placeholder.svg?height=40&width=40", specialization: "Cardio", status: "Active" },
  { id: "135", name: "Henry Lewis", email: "henry.l@example.com", phone: "+1 (555) 345-6789", avatar: "/placeholder.svg?height=40&width=40", specialization: "Yoga", status: "Inactive" },
  { id: "136", name: "Evelyn Lee", email: "evelyn.l@example.com", phone: "+1 (555) 456-7890", avatar: "/placeholder.svg?height=40&width=40", specialization: "Meditation", status: "Active" },
  { id: "137", name: "Alexander Walker", email: "alex.w@example.com", phone: "+1 (555) 567-8901", avatar: "/placeholder.svg?height=40&width=40", specialization: "Workout", status: "Inactive" },
  { id: "138", name: "Harper Hall", email: "harper.h@example.com", phone: "+1 (555) 678-9012", avatar: "/placeholder.svg?height=40&width=40", specialization: "Running", status: "Active" },
  { id: "139", name: "Daniel Allen", email: "daniel.a@example.com", phone: "+1 (555) 789-0123", avatar: "/placeholder.svg?height=40&width=40", specialization: "Cardio", status: "Inactive" },
  { id: "140", name: "Abigail Young", email: "abigail.y@example.com", phone: "+1 (555) 890-1234", avatar: "/placeholder.svg?height=40&width=40", specialization: "Yoga", status: "Active" },
  { id: "141", name: "Matthew King", email: "matthew.k@example.com", phone: "+1 (555) 901-2345", avatar: "/placeholder.svg?height=40&width=40", specialization: "Meditation", status: "Inactive" },
  { id: "142", name: "Elizabeth Wright", email: "elizabeth.w@example.com", phone: "+1 (555) 012-3456", avatar: "/placeholder.svg?height=40&width=40", specialization: "Workout", status: "Active" },
]

export default function UsersPage() {
  const [users, setUsers] = useState<typeof allUsers>([])
  const [filteredUsers, setFilteredUsers] = useState<typeof allUsers>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState({
    status: [] as string[],
    specialization: [] as string[]
  })
  
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(allUsers)
      setFilteredUsers(allUsers)
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Handle search and filtering
  useEffect(() => {
    let result = [...users]
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      )
    }
    
    // Apply status filters
    if (activeFilters.status.length > 0) {
      result = result.filter(user => activeFilters.status.includes(user.status))
    }
    
    // Apply specialization filters
    if (activeFilters.specialization.length > 0) {
      result = result.filter(user => activeFilters.specialization.includes(user.specialization))
    }
    
    setFilteredUsers(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchQuery, users, activeFilters])
  
  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredUsers.slice(startIndex, endIndex)
  }
  
  // Handle user status toggle
  const toggleUserStatus = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" } 
          : user
      )
    )
  }
  
  return (
    <div className="p-6 pt-24 w-full min-h-screen bg-gray-100"> {/* Added pt-24 to prevent header overlap and min-h-screen with bg-gray-100 for full background */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-6 w-full bg-white p-6 rounded-lg" // Added bg-white, p-6, and rounded-lg for the content area
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="bg-violet-100 p-2 rounded-lg">
              <UsersIcon className="h-6 w-6 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <Badge variant="outline" className="ml-2 bg-violet-50 text-violet-700 border-violet-200">
              {filteredUsers.length} total
            </Badge>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </div>
        
        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-violet-200 focus-visible:ring-violet-500"
            />
          </div>
          
          <UserFilters 
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
          />
        </motion.div>
        
        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full"
        >
          <Card className="border-violet-100 overflow-hidden w-full">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-violet-50">
                    <TableRow className="hover:bg-violet-50/80 border-violet-100">
                      <TableHead className="w-12 text-violet-700">#</TableHead>
                      <TableHead className="text-violet-700">User Name</TableHead>
                      <TableHead className="text-violet-700">Email</TableHead>
                      <TableHead className="text-violet-700">Phone</TableHead>
                      <TableHead className="text-violet-700">Specialization</TableHead>
                      <TableHead className="text-violet-700">Status</TableHead>
                      <TableHead className="text-right text-violet-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeletons
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`} className="hover:bg-violet-50/50 border-violet-100">
                          <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <Skeleton className="h-6 w-32" />
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <AnimatePresence mode="wait">
                        {getCurrentPageItems().map((user, index) => {
                          const SpecIcon = specializationIcons[user.specialization as keyof typeof specializationIcons]
                          
                          return (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="hover:bg-violet-50/50 border-violet-100 group"
                            >
                              <TableCell className="font-medium">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="border-2 border-violet-100 h-10 w-10 transition-all group-hover:border-violet-300">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-violet-100 text-violet-700">
                                      {user.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="font-medium">{user.name}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-violet-400" />
                                  <span className="text-sm">{user.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-violet-400" />
                                  <span className="text-sm">{user.phone}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="bg-violet-100 p-1 rounded-md">
                                    {SpecIcon && <SpecIcon className="h-4 w-4 text-violet-600" />}
                                  </div>
                                  <span>{user.specialization}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline" 
                                  className={`flex items-center gap-1 w-24 justify-center ${
                                    user.status === "Active" 
                                      ? "bg-green-50 text-green-700 border-green-200" 
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {user.status === "Active" ? (
                                    <><CheckCircle2 className="h-3 w-3" /> Active</>
                                  ) : (
                                    <><XCircle className="h-3 w-3" /> Inactive</>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  onClick={() => toggleUserStatus(user.id)}
                                  className={`
                                    transition-all duration-300 
                                    ${user.status === "Active" 
                                      ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                                      : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                    }
                                  `}
                                >
                                  {user.status === "Active" ? (
                                    <><UserX className="mr-2 h-4 w-4" /> Block</>
                                  ) : (
                                    <><UserCheck className="mr-2 h-4 w-4" /> Unblock</>
                                  )}
                                </Button>
                              </TableCell>
                            </motion.tr>
                          )
                        })}
                      </AnimatePresence>
                    )}
                    
                    {!isLoading && filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <UsersIcon className="h-12 w-12 mb-2 text-violet-200" />
                            <p className="text-lg font-medium">No users found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Pagination */}
        {!isLoading && filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center mt-4"
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="text-violet-600"
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
