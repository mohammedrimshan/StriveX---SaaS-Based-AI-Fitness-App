"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Plus, Filter, MoreHorizontal, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const Benefits = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("client-management")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const clients = [
    {
      id: 1,
      name: "Sarah Johnson",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      goal: "Weight Loss",
      nextSession: "Today, 2:00 PM",
      progress: 75,
      status: "active",
      isPremium: true,
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      name: "Michael Brown",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      goal: "Muscle Gain",
      nextSession: "Tomorrow, 10:00 AM",
      progress: 60,
      status: "active",
      isPremium: false,
      lastActive: "1 day ago",
    },
    {
      id: 3,
      name: "Emily Davis",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      goal: "Flexibility",
      nextSession: "Wed, 4:30 PM",
      progress: 40,
      status: "active",
      isPremium: true,
      lastActive: "Just now",
    },
    {
      id: 4,
      name: "David Wilson",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      goal: "Endurance",
      nextSession: "Pending",
      progress: 20,
      status: "pending",
      isPremium: false,
      lastActive: "3 days ago",
    },
    {
      id: 5,
      name: "Jessica Martinez",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      goal: "Toning",
      nextSession: "Inactive",
      progress: 0,
      status: "inactive",
      isPremium: false,
      lastActive: "2 weeks ago",
    },
  ]

  const filteredClients = activeTab === "all" ? clients : clients.filter((client) => client.status === activeTab)

  return (
    <section id="client-management" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <Card
          className={cn(
            "border border-gray-100 shadow-xl",
            "transform transition-all duration-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Client Management</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-9 border-gray-200">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm" className="h-9 bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>
          </CardHeader>

          <div className="px-6 border-b border-gray-100">
            <div className="flex space-x-6 overflow-x-auto pb-2">
              {["all", "active", "pending", "inactive"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-2 px-1 font-medium text-sm border-b-2 whitespace-nowrap transition-colors",
                    activeTab === tab
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-gray-500 hover:text-gray-700",
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} Clients
                </button>
              ))}
            </div>
          </div>

          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {filteredClients.map((client, index) => (
                <div
                  key={client.id}
                  className={cn(
                    "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors",
                    "transform transition-all duration-500",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
                  )}
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={client.image} alt={client.name} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {client.isPremium && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                          <Star className="h-3 w-3 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-gray-500">Goal: {client.goal}</p>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center space-x-4">
                    <div className="w-32">
                      <p className="text-sm font-medium">Next Session</p>
                      <p className="text-sm text-gray-500">{client.nextSession}</p>
                    </div>

                    <div className="w-40">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs font-medium">{client.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-violet-600 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width: isVisible ? `${client.progress}%` : "0%",
                            transitionDelay: `${index * 100 + 400}ms`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <Badge
                        className={cn(
                          client.status === "active" && "bg-green-100 text-green-800 hover:bg-green-100",
                          client.status === "pending" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                          client.status === "inactive" && "bg-gray-100 text-gray-800 hover:bg-gray-100",
                        )}
                      >
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 text-center">
              <Button variant="link" className="text-violet-600 hover:text-violet-700">
                View All Clients
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default Benefits

