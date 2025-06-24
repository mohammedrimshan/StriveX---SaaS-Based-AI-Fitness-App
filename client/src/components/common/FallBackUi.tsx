import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDumbbell, FaAppleAlt, FaBrain, FaHeart, FaLeaf, FaStar } from 'react-icons/fa';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

const FallbackUI = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [progress, setProgress] = useState(0);

  const themes = [
    {
      name: "workout",
      primary: "#7c3aed",
      secondary: "#a78bfa",
      bg: "#ddd6fe",
      accent: "#4c1d95",
      icon: <FaDumbbell />,
      message: "Powering up your workout"
    },
    {
      name: "diet",
      primary: "#e11d48",
      secondary: "#fb7185",
      bg: "#fecdd3",
      accent: "#9f1239",
      icon: <FaAppleAlt />,
      message: "Preparing fresh content"
    },
    {
      name: "mindfulness",
      primary: "#0ea5e9",
      secondary: "#7dd3fc",
      bg: "#e0f2fe",
      accent: "#0369a1",
      icon: <FaBrain />,
      message: "Finding inner peace"
    }
  ];

  const currentThemeData = themes[currentTheme];

  useEffect(() => {
    // Create floating particles
    const newParticles: Particle[] = Array(15).fill(0).map((_, index) => ({
      id: index,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3
    }));
    setParticles(newParticles);

    // Theme rotation
    const themeInterval = setInterval(() => {
      setCurrentTheme(prev => (prev + 1) % themes.length);
    }, 3000);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => {
      clearInterval(themeInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden flex items-center justify-center">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full opacity-20"
            style={{
              backgroundColor: currentThemeData.secondary,
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, -10, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${currentThemeData.primary} 0%, transparent 70%)`
        }}
      />

      {/* Main content */}
      <motion.div
        className="text-center z-10 px-4 max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main icon with pulse effect */}
        <motion.div
          className="relative mb-8"
          variants={itemVariants}
        >
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ backgroundColor: currentThemeData.bg }}
            variants={pulseVariants}
            animate="pulse"
          >
            <span
              className="text-3xl"
              style={{ color: currentThemeData.primary }}
            >
              {currentThemeData.icon}
            </span>
          </motion.div>

          {/* Orbiting mini icons */}
          {[FaHeart, FaLeaf, FaStar].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: currentThemeData.secondary,
                top: '50%',
                left: '50%',
                margin: '-12px 0 0 -12px'
              }}
              animate={{
                x: Math.sin(i * 120 * (Math.PI / 180)) * 60,
                y: Math.cos(i * 120 * (Math.PI / 180)) * 60,
                rotate: 360
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "linear"
              }}
            >
              <Icon className="text-white text-xs" />
            </motion.div>
          ))}
        </motion.div>

        {/* Brand name */}
        <motion.h1
          className="text-3xl font-bold mb-2"
          style={{ color: currentThemeData.primary }}
          variants={itemVariants}
        >
          StriveX
        </motion.h1>

        {/* Dynamic message */}
        <motion.p
          key={currentTheme}
          className="text-lg text-gray-600 mb-8"
          variants={itemVariants}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          {currentThemeData.message}
        </motion.p>

        {/* Progress bar */}
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: currentThemeData.primary }}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {Math.round(Math.min(progress, 100))}% complete
          </p>
        </motion.div>

        {/* Animated dots */}
        <motion.div
          className="flex justify-center gap-2"
          variants={itemVariants}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentThemeData.secondary }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Motivational text */}
        <motion.p
          className="text-sm text-gray-400 mt-6"
          variants={itemVariants}
        >
          Keep pushing forward! 💪
        </motion.p>
      </motion.div>

      {/* Corner theme indicators */}
      <div className="absolute top-6 right-6 flex gap-2">
        {themes.map((_$, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: index === currentTheme ? currentThemeData.primary : '#d1d5db'
            }}
            animate={{
              scale: index === currentTheme ? 1.2 : 1,
              opacity: index === currentTheme ? 1 : 0.5
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

export default FallbackUI;