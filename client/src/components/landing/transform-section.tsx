"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion, useInView } from "framer-motion"

export function TransformSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(var(--secondary),0.15),transparent_70%)]" />

      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            READY TO TRANSFORM <br />
            <span className="gradient-text text-4xl md:text-5xl">YOUR FITNESS JOURNEY?</span>
          </h2>

          <p className="text-lg text-muted-foreground">
            Join Our Exclusive Community Now And Experience The Power Of Data-Driven Fitness Like Never Before!
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-4"
          >
            <Button className="bg-gradient-to-r from-primary via-accent to-secondary text-white px-8 py-6 text-lg rounded-full hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 hover:-translate-y-1 animate-pulse">
              START YOUR JOURNEY
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

