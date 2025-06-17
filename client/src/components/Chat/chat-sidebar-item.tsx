"use client"

// D:\StriveX\client\src\components\Chat\chat-sidebar-item.tsx

import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { IChat } from "@/types/Chat"
import { UserAvatar } from "./user-avatar"
import { motion } from "framer-motion"

interface ChatSidebarItemProps {
  chat: IChat
  currentUserId: string
  isActive: boolean
  onClick: () => void
}

export function ChatSidebarItem({ chat, isActive, onClick }: ChatSidebarItemProps) {
  const participant = chat.participant
  const latestMessage = chat.lastMessage

  const truncateText = (text: string, maxLength = 30) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const getFormattedTime = (date: string | Date) => {
    const messageDate = new Date(date)
    const now = new Date()
    const isToday =
      messageDate.getDate() === now.getDate() &&
      messageDate.getMonth() === now.getMonth() &&
      messageDate.getFullYear() === now.getFullYear()

    if (isToday) {
      return (
        messageDate.getHours().toString().padStart(2, "0") + ":" + messageDate.getMinutes().toString().padStart(2, "0")
      )
    }
    return formatDistanceToNow(messageDate, { addSuffix: false })
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex p-3 gap-3 cursor-pointer rounded-lg transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-purple-100 to-indigo-100 border-l-4 border-purple-500"
          : "hover:bg-gray-100 border-l-4 border-transparent",
      )}
    >
      <UserAvatar
        user={{
          id: participant.userId,
          firstName: participant.firstName,
          lastName: participant.lastName,
          avatar: participant.avatar || "",
          isOnline: participant.isOnline,
          lastSeen: participant.lastSeen,
        }}
        showStatus={true}
        className={isActive ? "ring-2 ring-purple-300 ring-offset-1" : ""}
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3
            className={cn("font-medium truncate", isActive ? "text-purple-800" : "text-gray-800")}
          >{`${participant.firstName} ${participant.lastName}`}</h3>
          {latestMessage && (
            <span className="text-xs text-gray-500 font-medium">{getFormattedTime(latestMessage.createdAt)}</span>
          )}
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className={cn("text-sm truncate", isActive ? "text-purple-600" : "text-gray-500")}>
            {latestMessage ? truncateText(latestMessage.text) : "No messages yet"}
          </p>
          {chat.unreadCount > 0 && (
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.5rem] text-center shadow-sm">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
