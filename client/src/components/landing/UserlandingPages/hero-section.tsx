"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { motion, useAnimation, useInView } from "framer-motion"
import bg1 from '@/assets/common/bg1.png'
import bg2 from '@/assets/common/bg2.png'
import { useNavigate } from "react-router-dom"

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true })
  const controls = useAnimation()
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const smokeRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const handleStartJourney = () => {
    navigate("/login")
  }

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      
      // Animate smoke particles based on mouse position
      if (smokeRef.current) {
        const smoke = smokeRef.current
        const rect = smoke.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) - 0.5
        const y = ((e.clientY - rect.top) / rect.height) - 0.5
        
        smoke.style.transform = `translate(${x * 20}px, ${y * 20}px)`
      }
    }
    
    window.addEventListener("mousemove", handleMouseMove)
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.8 },
    },
  }

  // Subtle parallax effect based on mouse position
  const calculateParallax = (strength = 15) => {
    const x = (window.innerWidth / 2 - mousePosition.x) / strength
    const y = (window.innerHeight / 2 - mousePosition.y) / strength
    return { x, y }
  }

  return (
    <section ref={ref} className="relative pt-32 pb-20 overflow-hidden">
      {/* Animated smoke background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          ref={smokeRef}
          className="absolute inset-0 opacity-70"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          {/* Multiple smoke layers with different animations */}
          <motion.div 
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_60%)]"
            animate={{
              background: [
                "radial-gradient(ellipse at top right, rgba(139,92,246,0.15), transparent 60%)",
                "radial-gradient(ellipse at center, rgba(139,92,246,0.08), transparent 60%)",
                "radial-gradient(ellipse at bottom left, rgba(139,92,246,0.15), transparent 60%)",
                "radial-gradient(ellipse at top right, rgba(139,92,246,0.15), transparent 60%)",
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.1),transparent_40%)]"
            animate={{
              background: [
                "radial-gradient(circle at bottom left, rgba(167,139,250,0.1), transparent 40%)",
                "radial-gradient(circle at center, rgba(167,139,250,0.05), transparent 40%)",
                "radial-gradient(circle at top right, rgba(167,139,250,0.1), transparent 40%)",
                "radial-gradient(circle at bottom left, rgba(167,139,250,0.1), transparent 40%)",
              ]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 1 }}
          />
          <motion.div 
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.07),transparent_70%)]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate={controls} 
            className="space-y-8"
            style={{ 
              transform: `translate(${calculateParallax(100).x}px, ${calculateParallax(100).y}px)` 
            }}
          >
            <motion.div variants={itemVariants} className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                MAXIMIZE <br />
                POTENTIAL WITH <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-400">
                  AI-POWERED <br />
                  FITNESS
                </span>{" "}
                <br />
                EXCELLENCE!
              </h1>
            </motion.div>

            <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-lg">
              Join our exclusive fitness community! Compare goals with
              <span className="font-semibold text-foreground"> data-driven AI analysis.</span> Push limits, achieve
              greatness!
            </motion.p>

            <motion.div variants={itemVariants}>
              <Button 
                onClick={handleStartJourney}
                className="bg-gradient-to-r from-violet-700 via-violet-600 to-purple-500 text-white px-8 py-6 text-lg rounded-full hover:shadow-lg hover:shadow-violet-400/20 transition-all duration-300 hover:-translate-y-1"
              >
                START YOUR JOURNEY
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
            style={{ 
              transform: `translate(${calculateParallax(50).x}px, ${calculateParallax(50).y}px)` 
            }}
          >
            <div 
              className="relative h-[500px] w-full overflow-hidden rounded-3xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Using PNG images with transparent backgrounds and proper fade */}
              <div className="absolute inset-0 w-full h-full">
                {/* First image - always hidden when hovered */}
                <motion.img
                  src={bg1}
                  alt="Fitness woman with digital interface"
                  className="object-contain absolute inset-0 w-full h-full transform transition-transform duration-700"
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: isHovered ? 1.05 : 1,
                    opacity: isHovered ? 0 : 1
                  }}
                  transition={{ duration: 0.5 }}
                  loading="eager"
                />
                
                {/* Second image - only visible when hovered */}
                <motion.img
                  src={bg2}
                  alt="Person with fitness smartwatch"
                  className="object-contain absolute inset-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1.05 : 1
                  }}
                  transition={{ duration: 0.5 }}
                  loading="eager"
                />
              </div>
              
              {/* Gradient fade at the bottom of images */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
            </div>

            <motion.div
              variants={statsVariants}
              initial="hidden"
              animate={controls}
              whileHover={{ scale: 1.1 }}
              className="absolute top-20 right-10 bg-gradient-to-br from-violet-600 to-purple-400 text-white rounded-full p-4 shadow-lg border border-white/20 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">64%</span>
                <span className="text-xs">Progress</span>
              </div>
            </motion.div>

            <motion.div
              variants={statsVariants}
              initial="hidden"
              animate={controls}
              whileHover={{ scale: 1.1 }}
              className="absolute bottom-32 left-0 bg-gradient-to-br from-purple-500 to-violet-400 text-white rounded-full p-4 shadow-lg border border-white/20 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">12%</span>
                <span className="text-xs">Increase</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}