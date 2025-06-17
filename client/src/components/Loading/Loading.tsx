import { useEffect, useState } from "react";
import { Dumbbell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading process
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + Math.random() * 5;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 150);

    // Complete loading after animation (minimum 3.5 seconds)
    const timeout = setTimeout(() => {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setIsLoading(false), 800); // Short delay after reaching 100%
    }, 3500);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }
    }
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i:any) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.05 * i,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Enhanced gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-muted/20 pointer-events-none" />
          
          <div className="flex flex-col items-center gap-8 px-6 max-w-md z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1]
              }}
              className="relative"
            >
              {/* Enhanced pulsing background effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ 
                  filter: "blur(12px)",
                  transform: "translate(-50%, -50%)",
                  left: "50%",
                  top: "50%",
                  width: "140%",
                  height: "140%"
                }}
              />
              
              <div className="relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    rotate: {
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    scale: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  {/* Fixed dumbbell icon - keeping the original */}
                  <Dumbbell className="h-16 w-16 md:h-20 md:w-20 text-primary" strokeWidth={1.5} />
                </motion.div>
              </div>
            </motion.div>
            
            <div className="text-center z-10 space-y-4">
              {/* Animated title with gradient text matching Header.tsx */}
              <motion.div
                initial="hidden"
                animate="visible"
                className="overflow-hidden"
              >
                <motion.h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary text-transparent bg-clip-text inline-block">
                    {Array.from("StriveX").map((letter, i) => (
                      <motion.span
                        key={i}
                        custom={i}
                        variants={letterVariants}
                        className="inline-block"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </span>
                </motion.h1>
              </motion.div>

              <motion.p
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="text-base md:text-lg font-light tracking-wide bg-gradient-to-r from-primary/80 via-accent/80 to-secondary/80 text-transparent bg-clip-text"
              >
                Transform your fitness journey
              </motion.p>
            </div>
            
            {/* Enhanced progress bar with gradient */}
            <motion.div
              initial={{ width: "40%", opacity: 0 }}
              animate={{ width: "80%", opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-6 h-1 w-4/5 max-w-xs rounded-full bg-muted/30 overflow-hidden backdrop-blur-sm"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: [1, 1.05, 1] }}
              transition={{ 
                opacity: { delay: 0.6, duration: 0.5 },
                scale: { 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }
              }}
              className="text-sm font-medium text-foreground/80 bg-gradient-to-r from-primary/70 via-accent/70 to-secondary/70 text-transparent bg-clip-text"
            >
              {Math.round(progress)}%
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}