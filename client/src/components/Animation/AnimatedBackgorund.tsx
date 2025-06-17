"use client"

import React, { useRef, useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
// Import fitness-related icons from react-icons
import { IoFitness, IoWater, IoStopwatch } from "react-icons/io5"
import { GiWeightLiftingUp, GiMuscleUp } from "react-icons/gi"
import { FaRunning, FaAppleAlt, FaHeartbeat, FaDumbbell } from "react-icons/fa"
import { MdSportsHandball, MdSportsGymnastics } from "react-icons/md"

// Define fitness-themed particle types
const PARTICLE_TYPES = {
  DUMBBELL: "dumbbell",
  WATER_BOTTLE: "water-bottle",
  HEART_RATE: "heart-rate",
  STOPWATCH: "stopwatch",
  PROTEIN: "protein",
  RUNNING: "running",
  MUSCLE: "muscle",
  APPLE: "apple",
  GYMNASTICS: "gymnastics",
  HANDBALL: "handball"
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  speed: number
  opacity: number
  rotation: number
  type: string
  pathType: string
}

export default function AnimatedBackground({ children }: { children: React.ReactNode }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const requestRef = useRef<number | null>(null)

  // Fitness-themed color palette (with transparency for soft effect)
  const colors = useMemo(() => [
    "rgba(99, 102, 241, 0.4)",   // indigo (from original)
    "rgba(168, 85, 247, 0.4)",   // purple (from original)
    "rgba(236, 72, 153, 0.4)",   // pink (from original)
    "rgba(59, 130, 246, 0.4)",   // blue (from original)
    "rgba(16, 185, 129, 0.4)",   // emerald (from original)
    "rgba(245, 158, 11, 0.3)",   // amber (new)
    "rgba(220, 38, 38, 0.4)",    // red (new)
    "rgba(5, 150, 105, 0.4)",    // green (new)
  ], [])

  // Get random color from our fitness palette
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Different path types for more interesting movement
  const PATH_TYPES = {
    CIRCULAR: "circular",
    FIGURE_EIGHT: "figure-eight",
    ZIGZAG: "zigzag",
    WAVE: "wave",
    BOUNCE: "bounce"
  }

  // Initialize particles and handle resize
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
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  // Create particles when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    const particleTypes = Object.values(PARTICLE_TYPES)
    const pathTypes = Object.values(PATH_TYPES)

    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: Math.random() * 60 + 20,
      color: getRandomColor(),
      speed: Math.random() * 1 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      rotation: Math.random() * 360,
      type: particleTypes[Math.floor(Math.random() * particleTypes.length)],
      pathType: pathTypes[Math.floor(Math.random() * pathTypes.length)]
    }))

    setParticles(newParticles)
  }, [dimensions, colors])

  // Generate animation based on path type
  const getPathAnimation = (particle:any) => {
    const amplitude = 80 * particle.speed
    const duration = 15 + Math.random() * 20
    
    switch (particle.pathType) {
      case PATH_TYPES.CIRCULAR:
        return {
          x: [
            0,
            amplitude * Math.cos(0),
            amplitude * Math.cos(Math.PI/2),
            amplitude * Math.cos(Math.PI),
            amplitude * Math.cos(3*Math.PI/2),
            0
          ],
          y: [
            0,
            amplitude * Math.sin(0),
            amplitude * Math.sin(Math.PI/2),
            amplitude * Math.sin(Math.PI),
            amplitude * Math.sin(3*Math.PI/2),
            0
          ],
          scale: [1, 1.1, 1, 0.9, 1],
          rotate: [particle.rotation, particle.rotation + 180, particle.rotation + 360],
          opacity: [particle.opacity, particle.opacity + 0.1, particle.opacity - 0.05, particle.opacity + 0.1, particle.opacity],
          transition: { duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }
      
      case PATH_TYPES.FIGURE_EIGHT:
        return {
          x: [
            0,
            amplitude * 0.7,
            0,
            -amplitude * 0.7,
            0
          ],
          y: [
            0,
            amplitude * 0.5,
            0,
            amplitude * 0.5,
            0
          ],
          scale: [1, 1.05, 1, 1.05, 1],
          rotate: [particle.rotation, particle.rotation + 90, particle.rotation + 180, particle.rotation + 270, particle.rotation + 360],
          opacity: [particle.opacity, particle.opacity + 0.15, particle.opacity, particle.opacity + 0.15, particle.opacity],
          transition: { duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }
      
      case PATH_TYPES.ZIGZAG:
        return {
          x: [
            0,
            amplitude * 0.8,
            -amplitude * 0.4,
            amplitude * 0.6,
            0
          ],
          y: [
            0,
            amplitude * 0.5,
            -amplitude * 0.3,
            amplitude * 0.6,
            0
          ],
          scale: [1, 1.1, 0.95, 1.05, 1],
          rotate: [particle.rotation, particle.rotation + 45, particle.rotation + 180, particle.rotation + 270, particle.rotation + 360],
          opacity: [particle.opacity, particle.opacity + 0.1, particle.opacity - 0.05, particle.opacity + 0.05, particle.opacity],
          transition: { duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }
      
      case PATH_TYPES.WAVE:
        return {
          x: [
            0,
            amplitude * 0.8,
            0,
            -amplitude * 0.8,
            0
          ],
          y: [
            0,
            amplitude * 0.3,
            0,
            amplitude * 0.3,
            0
          ],
          scale: [1, 1.05, 1, 1.05, 1],
          rotate: [particle.rotation, particle.rotation + 20, particle.rotation + 180, particle.rotation + 200, particle.rotation + 360],
          opacity: [particle.opacity, particle.opacity + 0.1, particle.opacity, particle.opacity + 0.1, particle.opacity],
          transition: { duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }
      
      case PATH_TYPES.BOUNCE:
        return {
          x: [
            0,
            (Math.random() * 2 - 1) * amplitude * 0.5,
            (Math.random() * 2 - 1) * amplitude * 0.7,
            (Math.random() * 2 - 1) * amplitude * 0.3,
            0
          ],
          y: [
            0,
            -amplitude * 0.6,
            amplitude * 0.2,
            -amplitude * 0.4,
            0
          ],
          scale: [1, 1.15, 0.95, 1.05, 1],
          rotate: [particle.rotation, particle.rotation + 10, particle.rotation + 180, particle.rotation + 350, particle.rotation + 360],
          opacity: [particle.opacity, particle.opacity + 0.15, particle.opacity - 0.05, particle.opacity + 0.1, particle.opacity],
          transition: { duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }
      
      default:
        return {
          x: [
            0,
            (Math.random() * 100 - 50) * particle.speed,
            (Math.random() * 100 - 50) * particle.speed,
            0,
          ],
          y: [
            0,
            (Math.random() * 100 - 50) * particle.speed,
            (Math.random() * 100 - 50) * particle.speed,
            0,
          ],
          scale: [1, 1.1, 0.9, 1],
          rotate: [particle.rotation, particle.rotation + 180, particle.rotation + 360],
          opacity: [particle.opacity, particle.opacity + 0.1, particle.opacity - 0.1, particle.opacity],
          transition: { duration, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
        }
    }
  }

  // Render fitness icon from react-icons based on particle type
  const renderParticleIcon = (type: string, size: number, color: string) => {
    const iconProps = { size: size, color: color }
    
    switch (type) {
      case PARTICLE_TYPES.DUMBBELL:
        return <FaDumbbell {...iconProps} />
        
      case PARTICLE_TYPES.WATER_BOTTLE:
        return <IoWater {...iconProps} />
        
      case PARTICLE_TYPES.HEART_RATE:
        return <FaHeartbeat {...iconProps} />
        
      case PARTICLE_TYPES.STOPWATCH:
        return <IoStopwatch {...iconProps} />
        
      case PARTICLE_TYPES.PROTEIN:
        return <GiMuscleUp {...iconProps} />
        
      case PARTICLE_TYPES.RUNNING:
        return <FaRunning {...iconProps} />

      case PARTICLE_TYPES.MUSCLE:
        return <GiWeightLiftingUp {...iconProps} />

      case PARTICLE_TYPES.APPLE:
        return <FaAppleAlt {...iconProps} />

      case PARTICLE_TYPES.GYMNASTICS:
        return <MdSportsGymnastics {...iconProps} />

      case PARTICLE_TYPES.HANDBALL:
        return <MdSportsHandball {...iconProps} />
        
      default:
        return <IoFitness {...iconProps} />
    }
  }

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute flex items-center justify-center"
            style={{
              width: particle.size,
              height: particle.size,
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              rotate: particle.rotation,
            }}
            animate={getPathAnimation(particle)}
          >
            {renderParticleIcon(particle.type, particle.size, particle.color)}
          </motion.div>
        ))}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/50 to-white/90 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}