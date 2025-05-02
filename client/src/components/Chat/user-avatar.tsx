import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  user: {
    id: string
    firstName: string
    lastName: string
    avatar: string
    isOnline: boolean
    lastSeen?: string
  }
  size?: "sm" | "md" | "lg"
  showStatus?: boolean
  className?: string
}

export function UserAvatar({ user, size = "md", showStatus = true, className }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const statusSizeClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  }

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className, "border-2 border-white shadow-sm")}>
        <AvatarImage
          src={
            user.avatar ||
            `https://ui-avatars.com/api/?name=${user.firstName || "/placeholder.svg"}+${user.lastName}&background=10b981&color=fff`
          }
          alt={`${user.firstName} ${user.lastName}`}
        />
        <AvatarFallback className="bg-teal-500 text-white">
          {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            statusSizeClasses[size],
            user.isOnline ? "bg-green-500" : "bg-gray-300",
          )}
        />
      )}
    </div>
  )
}
