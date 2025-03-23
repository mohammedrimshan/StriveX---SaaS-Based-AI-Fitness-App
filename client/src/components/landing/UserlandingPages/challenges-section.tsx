"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Challenge {
  number: string
  title: string
  description: string
  color: string
}

const challenges: Challenge[] = [
  {
    number: "1",
    title: "Ignoring Your Unique Needs",
    description:
      "No cookie-cutter plans here. FitGenius understands that your body is one-of-a-kind. We analyze your daily habits, workouts, and feelings to create a plan just for you.",
    color: "from-purple-500 to-purple-700",
  },
  {
    number: "2",
    title: "Skipping Rest?",
    description:
      "Rest is crucial to understanding recovery. FitGenius monitors your progress with a keen focus on adequate rest, ensuring you thrive at every step of your journey.",
    color: "from-teal-500 to-teal-700",
  },
  {
    number: "3",
    title: "Generic Plans?",
    description:
      "FitGenius crafts plans as unique as your fingerprint. We analyze your daily input, workouts, and feelings, sculpting a roadmap tailored precisely to your aspirations.",
    color: "from-purple-500 to-purple-700",
  },
  {
    number: "4",
    title: "Meal Plan Mayhem?",
    description:
      "Say goodbye to the chaos of ever-changing meal plans. FitGenius leverages your data to establish consistent progress with insights backed by evidence.",
    color: "from-teal-500 to-teal-700",
  },
  {
    number: "5",
    title: "Working Too Much?",
    description:
      "FitGenius brings wisdom to your workouts. No more extreme methods. We align your routine with intelligent principles, ensuring every effort is calibrated for success.",
    color: "from-purple-500 to-purple-700",
  },
  {
    number: "6",
    title: "Trying Everything You Heard?",
    description:
      "In FitGenius, we replace trial and error with science. We use your workouts, meals, and fitness levels to guide you on a personalized science-backed journey.",
    color: "from-teal-500 to-teal-700",
  },
]

export function ChallengesSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,rgba(var(--secondary),0.1),transparent_50%)]" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-4xl font-bold">DO THESE SOUND FAMILIAR TO YOU AND</h2>
          <p className="text-2xl md:text-3xl font-bold text-accent">CAN'T YOU ACHIEVE YOUR GOALS?</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full card-hover border-0 overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${challenge.color} text-white`}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-xl font-bold">{challenge.number}</span>
                    </div>
                    <CardTitle>{challenge.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">{challenge.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

