"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { motion, useAnimation } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  speed: number
  opacity: number
}

export default function AnimatedBackground({ children }: { children: React.ReactNode }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const controls = useAnimation()

  // Generate random color with specific palette
  const getRandomColor = () => {
    const colors = [
      "rgba(99, 102, 241, 0.4)", // indigo
      "rgba(168, 85, 247, 0.4)", // purple
      "rgba(236, 72, 153, 0.4)", // pink
      "rgba(59, 130, 246, 0.4)", // blue
      "rgba(16, 185, 129, 0.4)", // emerald
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Initialize particles
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => {
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  // Create particles when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: Math.random() * 60 + 20,
      color: getRandomColor(),
      speed: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    setParticles(newParticles)
    controls.start({ opacity: 1 })
  }, [dimensions, controls])

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
            }}
            animate={{
              x: [
                particle.x,
                particle.x + (Math.random() * 100 - 50) * particle.speed,
                particle.x + (Math.random() * 100 - 50) * particle.speed,
                particle.x,
              ],
              y: [
                particle.y,
                particle.y + (Math.random() * 100 - 50) * particle.speed,
                particle.y + (Math.random() * 100 - 50) * particle.speed,
                particle.y,
              ],
              scale: [1, 1.1, 0.9, 1],
              opacity: [particle.opacity, particle.opacity + 0.1, particle.opacity - 0.1, particle.opacity],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white/90 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}

