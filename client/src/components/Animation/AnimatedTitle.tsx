"use client"

import { motion } from "framer-motion"

interface AnimatedTitleProps {
  title: string
  subtitle?: string
  className?: string
}

export default function AnimatedTitle({ title, subtitle, className }: AnimatedTitleProps) {
  const words = title.split(" ")

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={`text-center mb-8 sm:mb-12 ${className || ''}`}
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 tracking-tight leading-tight sm:leading-tight">
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block mr-2 sm:mr-4 last:mr-0">
            {word.split("").map((letter, letterIndex) => (
              <motion.span
                key={`${wordIndex}-${letterIndex}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: wordIndex * 0.1 + letterIndex * 0.03,
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                }}
                className="inline-block text-transparent bg-clip-text 
                           bg-gradient-to-r from-indigo-600 to-purple-600 
                           dark:from-indigo-400 dark:to-purple-400"
              >
                {letter}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}