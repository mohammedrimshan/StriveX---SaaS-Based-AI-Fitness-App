"use client"

import { useState, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
interface Testimonial {
  id: string
  name: string
  role: string
  image: string
  content: string
}

const testimonials: Testimonial[] = [
  {
    id: "alex",
    name: "Alex",
    role: "Marketing Specialist",
    image: "https://res.cloudinary.com/daee3szbl/image/upload/v1750762833/user1_llnzw8.jpg",
    content:
      "Hey, I'm Alex, an enthusiastic beginner in the fitness world. With personalized plans to fit into my busy schedule, AI-powered analysis, and meal advice based on my data, I saw pounds melt away and gained confidence. FitGenius showed me that data-driven fitness works!",
  },
  {
    id: "sarah",
    name: "Sarah",
    role: "Software Engineer",
    image: "https://res.cloudinary.com/daee3szbl/image/upload/v1750762832/user22_swrv0m.jpg",
    content:
      "As a software engineer with long desk hours, I struggled to find a fitness routine that worked. The AI-powered analysis understood my lifestyle and created a perfect balance of workouts and nutrition. I've lost 15 pounds and gained so much energy!",
  },
  {
    id: "carl",
    name: "Carl",
    role: "Teacher",
    image: "https://res.cloudinary.com/daee3szbl/image/upload/v1750762832/user3_w3zhlo.jpg",
    content:
      "After years of on-and-off gym memberships, I finally found consistency with StriveX. The personalized approach and data tracking keep me accountable. I'm stronger at 45 than I was at 25!",
  },
]

export function SuccessStoriesSection() {
  const [activeTestimonial, setActiveTestimonial] = useState("alex")
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const currentTestimonial = testimonials.find((t) => t.id === activeTestimonial)

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-primary"
        >
          SUCCESS STORIES
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-0 bg-gray-900 text-white overflow-hidden rounded-3xl shadow-xl">
            <CardContent className="p-8 md:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col md:flex-row gap-6 items-center md:items-start"
                >
                  <div className="flex-shrink-0">
                    <img
                      src={currentTestimonial?.image || ""}
                      alt={currentTestimonial?.name || ""}
                      className="w-[100px] h-[100px] rounded-full border-4 border-primary object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Hey, I'm {currentTestimonial?.name}</h3>
                    <p className="text-gray-300">{currentTestimonial?.content}</p>
                    <div className="pt-4">
                      <p className="text-primary font-semibold">{currentTestimonial?.name}</p>
                      <p className="text-sm text-gray-400">{currentTestimonial?.role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          <div className="flex justify-center items-center gap-4 mt-8">
            {testimonials.map((testimonial) => (
              <motion.button
                key={testimonial.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className={`relative rounded-full overflow-hidden w-12 h-12 border-2 transition-all duration-300 ${
                  activeTestimonial === testimonial.id
                    ? "border-primary scale-110"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                onClick={() => setActiveTestimonial(testimonial.id)}
              >
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </motion.button>
            ))}
          </div>

          <div className="flex justify-center mt-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const currentIndex = testimonials.findIndex((t) => t.id === activeTestimonial)
                const prevIndex = (currentIndex - 1 + testimonials.length) % testimonials.length
                setActiveTestimonial(testimonials[prevIndex].id)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const currentIndex = testimonials.findIndex((t) => t.id === activeTestimonial)
                const nextIndex = (currentIndex + 1) % testimonials.length
                setActiveTestimonial(testimonials[nextIndex].id)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}