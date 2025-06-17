import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaSearch, FaDumbbell, FaAppleAlt, FaBrain, FaStar, FaRegGem, FaArrowLeft } from 'react-icons/fa';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

const NotFoundPage = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentTheme, setCurrentTheme] = useState(0);

  const themes = [
    {
      name: "workout",
      primary: "#7c3aed",
      secondary: "#a78bfa",
      bg: "#ddd6fe",
      accent: "#4c1d95",
      icon: <FaDumbbell />,
      title: "Workout Not Found",
      subtitle: "This exercise seems to have skipped leg day!"
    },
    {
      name: "diet",
      primary: "#e11d48",
      secondary: "#fb7185",
      bg: "#fecdd3",
      accent: "#9f1239",
      icon: <FaAppleAlt />,
      title: "Recipe Missing",
      subtitle: "This page is as empty as your fridge!"
    },
    {
      name: "mindfulness",
      primary: "#0ea5e9",
      secondary: "#7dd3fc",
      bg: "#e0f2fe",
      accent: "#0369a1",
      icon: <FaBrain />,
      title: "Zen Not Found",
      subtitle: "Even our mindfulness couldn't find this page!"
    }
  ];

  const currentThemeData = themes[currentTheme];

  useEffect(() => {
    const newParticles: Particle[] = Array(20).fill(0).map((_, index) => ({
      id: index,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setCurrentTheme(prev => (prev + 1) % themes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
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

  const features = [
    {
      icon: <FaHome />,
      title: "Back to Home",
      description: "Return to safety",
      color: currentThemeData.primary,
      bgColor: currentThemeData.bg,
      action: () => console.log("Navigate home")
    },
    {
      icon: <FaSearch />,
      title: "Search Site",
      description: "Find what you need",
      color: currentThemeData.accent,
      bgColor: currentThemeData.bg,
      action: () => console.log("Open search")
    },
    {
      icon: <FaArrowLeft />,
      title: "Go Back",
      description: "Previous page",
      color: currentThemeData.secondary,
      bgColor: currentThemeData.bg,
      action: () => console.log("Go back")
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden mt-10">
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
              y: [0, -20, 0],
              x: [0, 10, -5, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Theme indicator dots */}
      <div className="absolute top-8 right-8 flex gap-2">
        {themes.map((_, index) => (
          <motion.button
            key={index}
            className="w-3 h-3 rounded-full border-2 border-white/50"
            style={{
              backgroundColor: index === currentTheme ? currentThemeData.primary : 'transparent'
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentTheme(index)}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTheme}
            className="text-center mb-12"
            initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
          >
            {/* 404 with animated icon */}
            <div className="relative mb-8">
              <motion.div
                className="text-9xl md:text-[12rem] font-black text-gray-200 select-none"
                animate={{
                  textShadow: [
                    `0 0 20px ${currentThemeData.primary}20`,
                    `0 0 40px ${currentThemeData.primary}40`,
                    `0 0 20px ${currentThemeData.primary}20`
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                404
              </motion.div>

              {/* Floating icon in the "0" */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-6xl"
                style={{ color: currentThemeData.primary }}
                animate={{
                  y: [-10, 10, -10],
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {currentThemeData.icon}
              </motion.div>

              {/* Orbiting elements */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: currentThemeData.secondary,
                    top: '50%',
                    left: '50%',
                    margin: '-8px 0 0 -8px'
                  }}
                  animate={{
                    x: Math.sin(i * 60 * (Math.PI / 180)) * 120,
                    y: Math.cos(i * 60 * (Math.PI / 180)) * 120,
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "linear"
                  }}
                />
              ))}
            </div>

            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: currentThemeData.primary }}
              variants={itemVariants}
            >
              {currentThemeData.title}
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 mb-2"
              variants={itemVariants}
            >
              {currentThemeData.subtitle}
            </motion.p>

            <motion.p
              className="text-gray-500 max-w-md mx-auto"
              variants={itemVariants}
            >
              The page you're looking for seems to have taken a rest day. Let's get you back to StriveX!
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Action cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.button
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100"
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 10px 30px ${currentThemeData.primary}20`
              }}
              whileTap={{ scale: 0.98 }}
              onClick={feature.action}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: feature.bgColor }}
              >
                <span
                  className="text-xl"
                  style={{ color: feature.color }}
                >
                  {feature.icon}
                </span>
              </div>
              <h4
                className="font-bold text-lg mb-2"
                style={{ color: currentThemeData.primary }}
              >
                {feature.title}
              </h4>
              <p className="text-sm text-gray-500">
                {feature.description}
              </p>
            </motion.button>
          ))}
        </motion.div>

        {/* Bottom decorative elements */}
        <motion.div
          className="mt-16 flex items-center gap-4"
          variants={itemVariants}
        >
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
              >
                {i % 2 === 0 ?
                  <FaStar className="text-yellow-400 text-sm" /> :
                  <FaRegGem className="text-emerald-400 text-sm" />
                }
              </motion.div>
            ))}
          </div>
          <span className="text-gray-400 text-sm">Keep pushing forward!</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;