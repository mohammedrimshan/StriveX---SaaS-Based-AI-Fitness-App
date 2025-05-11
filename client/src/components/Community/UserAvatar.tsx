"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "./index"
import { motion } from "framer-motion"

interface UserAvatarProps {
  user?: User // make optional
  className?: string
  size?: "sm" | "md" | "lg"
}

const UserAvatar = ({ user, className = "", size = "md" }: UserAvatarProps) => {
  // Remove console.log in production code
  
  const getSize = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8"
      case "lg":
        return "h-12 w-12"
      case "md":
      default:
        return "h-10 w-10"
    }
  }

  // Safe check if user exists and has a name property
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U" // fallback to "U" for Unknown

  return (
    <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
      <Avatar className={`${getSize()} ${className} ring-2 ring-violet-500/30 ring-offset-2 ring-offset-slate-900`}>
        {/* Always provide a fallback if avatarUrl is undefined or empty */}
        <AvatarImage 
          src={user?.avatarUrl || "/placeholder.svg"} 
          alt={user?.name || "Unknown User"} 
          onError={(e) => {
            // If image fails to load, set src to placeholder
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = "/placeholder.svg";
          }}
        />
        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
    </motion.div>
  )
}

export default UserAvatar