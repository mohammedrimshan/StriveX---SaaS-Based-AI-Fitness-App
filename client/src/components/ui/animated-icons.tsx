"use client"

import type React from "react"
import { motion } from "framer-motion"
import {
  Activity,
  Dumbbell,
  Heart,
  Droplet,
  Target,
  Ruler,
  Weight,
  User,
  Mail,
  Phone,
  Utensils,
  Apple,
  Leaf,
} from "lucide-react"

interface AnimatedIconProps {
  icon: string
  size?: number
  color?: string
  className?: string
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon,
  size = 16,
  color = "currentColor",
  className = "",
}) => {
  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
    hover: {
      scale: 1.1,
      rotate: [0, 5, 0, -5, 0],
      transition: { duration: 0.5 },
    },
  }

  const renderIcon = () => {
    const props = { size, color, className }

    switch (icon) {
      case "activity":
        return <Activity {...props} />
      case "dumbbell":
        return <Dumbbell {...props} />
      case "heart":
        return <Heart {...props} />
      case "droplet":
        return <Droplet {...props} />
      case "target":
        return <Target {...props} />
      case "ruler":
        return <Ruler {...props} />
      case "weight":
        return <Weight {...props} />
      case "user":
        return <User {...props} />
      case "mail":
        return <Mail {...props} />
      case "phone":
        return <Phone {...props} />
      case "utensils":
        return <Utensils {...props} />
      case "apple":
        return <Apple {...props} />
      case "leaf":
        return <Leaf {...props} />
      default:
        return <Activity {...props} />
    }
  }

  return (
    <motion.div variants={iconVariants} initial="initial" animate="animate" whileHover="hover" className="inline-flex">
      {renderIcon()}
    </motion.div>
  )
}

export const PulsingIcon: React.FC<AnimatedIconProps> = (props) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration: 2,
        ease: "easeInOut",
      }}
    >
      <AnimatedIcon {...props} />
    </motion.div>
  )
}

