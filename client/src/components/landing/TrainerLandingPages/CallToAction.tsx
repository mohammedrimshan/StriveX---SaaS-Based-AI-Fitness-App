"use client"

import { Calendar } from "@/components/ui/calendar"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, Share2, Users, ChevronRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const CallToAction = () => {
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

    const element = document.getElementById("trainer-community")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const posts = [
    {
      id: 1,
      author: "Jessica Martinez",
      authorRole: "Yoga Instructor",
      authorImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      content:
        "Just shared a new 30-minute yoga sequence with my clients through the workout builder. They're loving the guided videos! #YogaTrainer",
      likes: 24,
      comments: 5,
      time: "2 hours ago",
      image:
        "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: 2,
      author: "Marcus Johnson",
      authorRole: "Strength Coach",
      authorImage:
        "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80",
      content:
        "Question for other trainers: What's your approach to periodization for clients who can only train twice a week? Looking for some fresh ideas.",
      likes: 18,
      comments: 12,
      time: "1 day ago",
      image: null,
    },
  ]

  const events = [
    {
      id: 1,
      title: "Fitness Business Workshop",
      date: "June 15, 2023",
      time: "1:00 PM - 3:00 PM",
      attendees: 42,
      type: "Virtual",
    },
    {
      id: 2,
      title: "Nutrition Certification Course",
      date: "July 10-12, 2023",
      time: "9:00 AM - 4:00 PM",
      attendees: 28,
      type: "In Person",
    },
  ]

  return (
    <section id="trainer-community" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Trainer Community</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with other fitness professionals, share insights, and grow together
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card
              className={cn(
                "border border-gray-100 shadow-xl",
                "transform transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
              )}
            >
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="text-xl font-bold">Community Feed</CardTitle>
                <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700">
                  Create Post
                </Button>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {posts.map((post, index) => (
                    <div
                      key={post.id}
                      className={cn(
                        "p-4",
                        "transform transition-all duration-500",
                        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
                      )}
                      style={{ transitionDelay: `${index * 100 + 200}ms` }}
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.authorImage} alt={post.author} />
                          <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{post.author}</h4>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{post.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{post.authorRole}</p>
                          <p className="text-gray-700 mb-4">{post.content}</p>

                          {post.image && (
                            <div className="mb-4 rounded-lg overflow-hidden">
                              <img
                                src={post.image || "/placeholder.svg"}
                                alt="Post attachment"
                                className="w-full h-auto object-cover"
                              />
                            </div>
                          )}

                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-gray-600 hover:text-violet-600 hover:bg-violet-50 space-x-1"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>{post.likes}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-gray-600 hover:text-violet-600 hover:bg-violet-50 space-x-1"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>{post.comments}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-gray-600 hover:text-violet-600 hover:bg-violet-50"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 text-center">
                  <Button variant="link" className="text-violet-600 hover:text-violet-700">
                    View More Posts
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card
              className={cn(
                "border border-gray-100 shadow-xl",
                "transform transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
              )}
              style={{ transitionDelay: "200ms" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {events.map((event, index) => (
                    <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <h4 className="font-medium mb-1">{event.title}</h4>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {event.date}, {event.time}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          {event.attendees} attending
                        </div>
                        <Badge
                          className={cn(
                            event.type === "Virtual"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : "bg-green-100 text-green-800 hover:bg-green-100",
                          )}
                        >
                          {event.type}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-violet-200 text-violet-600 hover:bg-violet-50"
                      >
                        Register
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="p-4 text-center">
                  <Button variant="link" className="text-violet-600 hover:text-violet-700">
                    View All Events
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "border border-gray-100 shadow-xl",
                "transform transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
              )}
              style={{ transitionDelay: "400ms" }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Resources</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Business Growth Guide", type: "PDF" },
                    { title: "Client Retention Strategies", type: "Video" },
                    { title: "Marketing Templates", type: "Templates" },
                  ].map((resource, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-xs text-gray-500">{resource.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction

