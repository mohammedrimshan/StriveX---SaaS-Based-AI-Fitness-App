"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, FileText, MessageSquare, BarChart, Calendar, Settings, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const Testimonials = () => {
  const [isVisible, setIsVisible] = useState(false)

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

    const element = document.getElementById("trainer-tools")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const tools = [
    {
      icon: <Dumbbell className="h-6 w-6" />,
      title: "Workout Builder",
      description: "Create custom workouts for your clients with our drag-and-drop builder",
      color: "bg-blue-100 text-blue-600",
      isNew: false,
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Nutrition Plans",
      description: "Design meal plans and track client nutrition progress",
      color: "bg-green-100 text-green-600",
      isNew: true,
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Client Messaging",
      description: "Communicate with clients through our secure messaging platform",
      color: "bg-violet-100 text-violet-600",
      isNew: false,
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Monitor client metrics and visualize their progress over time",
      color: "bg-orange-100 text-orange-600",
      isNew: false,
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Schedule Manager",
      description: "Manage your availability and automate appointment bookings",
      color: "bg-pink-100 text-pink-600",
      isNew: false,
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Business Settings",
      description: "Configure your profile, payments, and notification preferences",
      color: "bg-gray-100 text-gray-600",
      isNew: false,
    },
  ]

  return (
    <section id="trainer-tools" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Trainer Tools</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your fitness business in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <Card
              key={index}
              className={cn(
                "border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                "transform transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tool.color}`}>
                    {tool.icon}
                  </div>
                  {tool.isNew && (
                    <span className="px-2 py-1 bg-violet-100 text-violet-800 text-xs font-medium rounded-full">
                      NEW
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                <Button
                  variant="ghost"
                  className="p-0 h-auto text-violet-600 hover:text-violet-700 hover:bg-transparent group"
                >
                  <span>Open Tool</span>
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials

