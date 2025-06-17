"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Video, Calendar, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const HowItWork = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

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

    const element = document.getElementById("upcoming-sessions")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const sessions = [
    {
      id: 1,
      clientName: "Sarah Johnson",
      clientImage:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      time: "2:00 PM - 3:00 PM",
      type: "In Person",
      location: "Fitness Center",
      status: "confirmed",
    },
    {
      id: 2,
      clientName: "Michael Brown",
      clientImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      time: "10:00 AM - 11:00 AM",
      type: "Virtual",
      location: "Zoom Meeting",
      status: "pending",
    },
    {
      id: 3,
      clientName: "Emily Davis",
      clientImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      time: "4:30 PM - 5:30 PM",
      type: "In Person",
      location: "Client's Home",
      status: "confirmed",
    },
    {
      id: 4,
      clientName: "David Wilson",
      clientImage:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      time: "6:00 PM - 7:00 PM",
      type: "Virtual",
      location: "Google Meet",
      status: "cancelled",
    },
  ]

  // Generate dates for the calendar
  const getDates = () => {
    const dates = []
    const today = new Date()

    for (let i = -3; i < 11; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }

    return dates
  }

  const formatDate = (date:any) => {
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)
  }

  const isToday = (date:any) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date:any) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  return (
    <section id="upcoming-sessions" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card
          className={cn(
            "border border-gray-100 shadow-xl",
            "transform transition-all duration-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Upcoming Sessions</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-9 border-gray-200">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
              <Button size="sm" className="h-9 bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </div>
          </CardHeader>

          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {getDates().map((date, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex flex-col items-center justify-center w-14 h-16 rounded-lg transition-colors",
                    isSelected(date)
                      ? "bg-violet-600 text-white"
                      : isToday(date)
                        ? "bg-violet-100 text-violet-800 hover:bg-violet-200"
                        : "bg-white border border-gray-200 hover:border-violet-200 hover:bg-violet-50",
                  )}
                >
                  <span className="text-xs font-medium">{formatDate(date)}</span>
                  <span className="text-lg font-bold">{date.getDate()}</span>
                </button>
              ))}
            </div>
          </div>

          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {sessions.map((session, index) => (
                <div
                  key={session.id}
                  className={cn(
                    "flex items-center justify-between p-4 hover:bg-gray-50 transition-colors",
                    "transform transition-all duration-500",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
                  )}
                  style={{ transitionDelay: `${index * 100 + 200}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.clientImage} alt={session.clientName} />
                      <AvatarFallback>{session.clientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{session.clientName}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.time}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center space-x-4">
                    <div className="flex items-center">
                      {session.type === "In Person" ? (
                        <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                      ) : (
                        <Video className="h-4 w-4 text-gray-500 mr-1" />
                      )}
                      <span className="text-sm text-gray-700">{session.location}</span>
                    </div>

                    <Badge
                      className={cn(
                        session.status === "confirmed" && "bg-green-100 text-green-800 hover:bg-green-100",
                        session.status === "pending" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
                        session.status === "cancelled" && "bg-red-100 text-red-800 hover:bg-red-100",
                      )}
                    >
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="p-4 text-center">
              <Button variant="link" className="text-violet-600 hover:text-violet-700">
                View All Sessions
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default HowItWork

