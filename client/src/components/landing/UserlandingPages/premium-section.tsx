"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion, useInView } from "framer-motion"
import prem1 from '@/assets/common/prem.svg'
import prem2 from '@/assets/common/prem2.svg'

export function PremiumSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  
  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      {/* Background gradient elements */}
      <motion.div 
        className="absolute -z-10 top-1/4 left-0 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
        transition={{ duration: 1.5 }}
      />
      <motion.div 
        className="absolute -z-10 bottom-1/4 right-0 w-64 h-64 rounded-full bg-violet-500/20 blur-3xl"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.6 } : { opacity: 0 }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between relative">
          {/* Left Image - positioned lower and more to the left */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -80 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-8 lg:mb-0 lg:self-end lg:mt-16 lg:-ml-12 xl:-ml-24"
          >
            <motion.div 
              className="w-80 h-80 md:w-96 md:h-96 lg:w-112 lg:h-112 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              animate={{ 
                y: [0, -10, 0], 
                rotate: [0, -2, 0] 
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                repeatType: "mirror",
                ease: "easeInOut" 
              }}
            >
              <img
                src={prem1}
                alt="Fitness woman"
                className="object-contain w-full h-full"
              />
            </motion.div>
            
            <motion.div 
              className="absolute top-4 right-0 bg-white/90 text-red-500 rounded-full px-3 py-1 text-sm font-bold shadow-lg flex items-center gap-1"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, delay: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              >❤️</motion.span> 1K
            </motion.div>
          </motion.div>

          {/* Center Text Content - keeping position unchanged */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-center max-w-xl mx-auto px-4 lg:px-6 z-10"
          >
            <motion.h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6" 
              style={{ 
                background: "linear-gradient(90deg, #2c7da0 0%, #6a4c93 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              TRY OUR PREMIUM VERSION
            </motion.h2>
            
            <motion.p 
              className="text-lg text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Ready to go deeper? Try our premiere version for access to custom workout plans, guided meditation, and
              exclusive wellness insights. Your next level of health awaits.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white px-8 py-2 rounded-full hover:shadow-lg hover:shadow-violet-400/20 transition-all duration-300">
                START NOW
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Image - positioned higher and more to the right */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 80 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="relative mt-8 lg:mt-0 lg:self-start lg:-mt-16 lg:-mr-12 xl:-mr-24"
          >
            <motion.div 
              className="w-80 h-80 md:w-96 md:h-96 lg:w-112 lg:h-112 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              animate={{ 
                y: [0, 10, 0], 
                rotate: [0, 2, 0] 
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                repeatType: "mirror",
                ease: "easeInOut",
                delay: 1.5
              }}
            >
              <img
                src={prem2}
                alt="Yoga woman"
                className="object-contain w-full h-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}