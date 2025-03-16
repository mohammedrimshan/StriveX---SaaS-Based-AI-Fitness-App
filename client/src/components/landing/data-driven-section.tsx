"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, BarChart3, Apple } from "lucide-react"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  bgColor: string
}

const features: Feature[] = [
  {
    icon: <Activity className="h-10 w-10 text-white" />,
    title: "Advanced AI Technology",
    description:
      "Our advanced AI technology analyzes your fitness data, body metrics, and previous experience to provide real-time insights. Make informed decisions based on your unique profile to optimize your workouts, nutrition, and recovery routine like never before.",
    bgColor: "bg-purple-700",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-white" />,
    title: "Stay motivated and track your progress",
    description:
      "Stay motivated and track your progress effortlessly with our cutting-edge fitness tracker. Seamlessly monitor your performance, set new milestones, and visualize your journey with beautiful charts right before your eyes.",
    bgColor: "bg-primary",
  },
  {
    icon: <Apple className="h-10 w-10 text-white" />,
    title: "Rich genetic data! Our AI-powered analysis",
    description:
      "Rich genetic data! Our AI-powered analysis curates personalized meal plans to fuel your body optimally. Achieve your fitness goals with scientifically-backed nutrition tailored to your unique body composition.",
    bgColor: "bg-accent",
  },
]

export function DataDrivenSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary),0.1),transparent_70%)]" />

      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-center mb-4"
        >
          DATA-DRIVEN
        </motion.h2>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-center mb-16 text-primary"
        >
          DECISIONS ON FITNESS
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
            >
              <Card className="h-full card-hover border-0">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`${feature.bgColor} p-4 rounded-lg relative`}>
                    {feature.icon}
                    <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-white animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

