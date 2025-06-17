"use client"

import React, { useEffect, useRef, useState } from "react"
import { useChatHistory, useChatParticipants } from "@/hooks/chat/useChatQueries"
import { useSocket } from "@/context/socketContext"
import { ChatMessage } from "./chatMessage"
import { TypingIndicator } from "./typing-indicator"
import type { IMessage, ChatHistoryResponse, ChatParticipantsResponse, IChatParticipant, Participant } from "@/types/Chat"
import type { UserRole } from "@/types/UserRole"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { ArrowDown } from 'lucide-react'

interface ChatMessagesProps {
  participantId: string
  participant: Participant
  role: UserRole
  currentUserId: string
  onReply: (messageId: string) => void
}

export const ChatMessages = React.memo(
  ({ participantId, participant: propParticipant, role, currentUserId, onReply }: ChatMessagesProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const previousParticipantIdRef = useRef<string | null>(null)

    const {
      data: chatHistoryData,
      isLoading: isLoadingHistory,
      error: historyError,
      refetch,
    } = useChatHistory(role, participantId) as {
      data: ChatHistoryResponse | undefined;
      isLoading: boolean;
      error: Error | null;
      refetch: () => void;
    };

    const {
      data: participantsData,
      isLoading: isLoadingParticipants,
      error: participantsError,
    } = useChatParticipants(role) as {
      data: ChatParticipantsResponse | undefined;
      isLoading: boolean;
      error: Error | null;
    };

    const { messages: socketMessages, typingUsers, clearMessages, isConnected } = useSocket()
    const [localMessages, setLocalMessages] = useState<IMessage[]>([])
    const [showScrollButton, setShowScrollButton] = useState(false)
    const [showTypingIndicator, setShowTypingIndicator] = useState(false)
    const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)
    const [newMessageCount, setNewMessageCount] = useState(0)

    const { client, trainer } = useSelector((state: RootState) => ({
      client: state.client.client,
      trainer: state.trainer.trainer,
    }))
    const currentUser = client || trainer

    const participant: IChatParticipant | undefined =
      participantsData?.success && participantsData.participants
        ? participantsData.participants.find(
            (p: IChatParticipant) => String(p.userId) === String(participantId) || String(p.id) === String(participantId),
          )
        : propParticipant as IChatParticipant;

    useEffect(() => {
      if (previousParticipantIdRef.current && previousParticipantIdRef.current !== participantId) {
        setLocalMessages([])
        clearMessages()
      }
      previousParticipantIdRef.current = participantId
    }, [participantId, clearMessages])

    useEffect(() => {
      if (!chatHistoryData?.messages) {
        return
      }

      setLocalMessages((prevMessages) => {
        const historicalMessages = [...chatHistoryData.messages]
        const uniqueHistoryMessages = historicalMessages.filter(
          (histMsg) =>
            !prevMessages.some(
              (existingMsg) =>
                (String(existingMsg.id) === String(histMsg.id) || String(existingMsg.tempId) === String(histMsg.id)) &&
                !existingMsg._fromSocket,
            ),
        )

        const socketOnlyMessages = prevMessages.filter((msg) => msg._fromSocket)
        const combined = [...uniqueHistoryMessages, ...socketOnlyMessages]

        combined.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.createdAt || 0).getTime()
          const dateB = new Date(b.timestamp || b.createdAt || 0).getTime()
          return dateA - dateB
        })

        return combined
      })
    }, [chatHistoryData])

    useEffect(() => {
      if (socketMessages.length === 0) {
        return
      }

      setLocalMessages((prevMessages) => {
        const relevantNewMessages = socketMessages.filter((msg) => {
          const isIncoming = String(msg.senderId) === String(participantId)
          const isOutgoing =
            String(msg.senderId) === String(currentUserId) && String(msg.receiverId) === String(participantId)
          const isValidWithoutReceiverId = !msg.receiverId && isIncoming
          return isIncoming || isOutgoing || isValidWithoutReceiverId
        })

        if (relevantNewMessages.length === 0) return prevMessages

        const incomingMessages = relevantNewMessages.filter((msg) => String(msg.senderId) !== String(currentUserId))
        if (incomingMessages.length > 0 && !isAutoScrollEnabled) {
          setNewMessageCount((prev) => prev + incomingMessages.length)
        }

        const markedMessages = relevantNewMessages.map((msg) => ({
          ...msg,
          _fromSocket: true,
          receiverId: msg.receiverId || currentUserId,
          createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
          updatedAt: msg.updatedAt || new Date().toISOString(),
          deleted: msg.deleted || false,
          reactions: msg.reactions || [],
        } as IMessage))

        const allMessages = [...prevMessages, ...markedMessages]
        const uniqueMessages = allMessages.reduce((acc, current) => {
          const idExists = acc.some(
            (item) =>
              String(item.id) === String(current.id) ||
              (current.tempId && String(item.tempId) === String(current.tempId)) ||
              (current.tempId && String(item.id) === String(current.tempId)),
          )
          if (!idExists) {
            acc.push(current)
          }
          return acc
        }, [] as IMessage[])

        uniqueMessages.sort((a, b) => {
          const dateA = new Date(a.timestamp || a.createdAt || 0).getTime()
          const dateB = new Date(b.timestamp || b.createdAt || 0).getTime()
          return dateA - dateB
        })

        return uniqueMessages
      })
    }, [socketMessages, currentUserId, participantId, isAutoScrollEnabled])

    useEffect(() => {
      if (isAutoScrollEnabled && localMessages.length > 0) {
        scrollToBottom()
      }
    }, [localMessages, isAutoScrollEnabled])

    useEffect(() => {
      const container = containerRef.current
      if (!container) return

      let timeout: NodeJS.Timeout
      const handleScroll = () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          const { scrollTop, scrollHeight, clientHeight } = container
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 50

          setIsAutoScrollEnabled(isNearBottom)
          setShowScrollButton(!isNearBottom)

          if (isNearBottom && newMessageCount > 0) {
            setNewMessageCount(0)
          }
        }, 100)
      }

      container.addEventListener("scroll", handleScroll)
      return () => {
        container.removeEventListener("scroll", handleScroll)
        clearTimeout(timeout)
      }
    }, [newMessageCount])

    useEffect(() => {
      if (participantId && typingUsers.has(String(participantId))) {
        setShowTypingIndicator(true)
      } else {
        setShowTypingIndicator(false)
      }
    }, [typingUsers, participantId])

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      if (newMessageCount > 0) {
        setNewMessageCount(0)
      }
      setIsAutoScrollEnabled(true)
    }

    const shouldShowAvatar = (message: IMessage, index: number): boolean => {
      if (index === 0) return true
      return String(localMessages[index - 1].senderId) !== String(message.senderId)
    }

    const formatMessageDate = (dateString: string): string => {
      const messageDate = new Date(dateString)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      messageDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      yesterday.setHours(0, 0, 0, 0)

      if (messageDate.getTime() === today.getTime()) {
        return "Today"
      } else if (messageDate.getTime() === yesterday.getTime()) {
        return "Yesterday"
      } else {
        return messageDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })
      }
    }

    const getMessageSender = (
      senderId: string,
    ): {
      id: string
      firstName: string
      lastName: string
      email: string
      role: UserRole
      isOnline: boolean
      avatar: string
    } => {
      if (currentUser && String(senderId) === String(currentUserId)) {
        const firstName = currentUser.firstName || "Unknown"
        const lastName = currentUser.lastName || ""
        return {
          id: senderId,
          firstName,
          lastName,
          email: currentUser.email || "",
          role: role,
          isOnline: true,
          avatar:
            currentUser.profileImage ||
            `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=10b981&color=fff`,
        }
      }

      let sender = participantsData?.participants?.find((p: IChatParticipant) => String(p.userId) === String(senderId))

      if (
        !sender &&
        propParticipant &&
        (String(propParticipant.userId) === String(senderId) || String(propParticipant.id) === String(senderId))
      ) {
        sender = propParticipant as IChatParticipant
      }

      if (!sender) {
        sender = participantsData?.participants?.find((p: IChatParticipant) => String(p.id) === String(senderId))
      }

      if (!sender) {
        return {
          id: senderId,
          firstName: "Unknown",
          lastName: "User",
          email: "",
          role: role,
          isOnline: false,
          avatar: `https://ui-avatars.com/api/?name=Unknown+User&background=10b981&color=fff`,
        }
      }

      const firstName = sender.firstName || (sender.name ? sender.name.split(" ")[0] : "Unknown")
      const lastName = sender.lastName || (sender.name ? sender.name.split(" ").slice(1).join(" ") : "")

      return {
        id: senderId,
        firstName,
        lastName,
        email: sender.email || "",
        role: sender.role || role,
        isOnline: sender.isOnline || sender.status === "online",
        avatar:
          sender.avatar || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=10b981&color=fff`,
      }
    }

    const allParticipants = React.useMemo(() => {
      const participants = participantsData?.participants || []
      if (
        propParticipant &&
        !participants.some(
          (p: IChatParticipant) => String(p.userId) === String(propParticipant.userId) || String(p.id) === String(propParticipant.id),
        )
      ) {
        const firstName = propParticipant.firstName || propParticipant.name?.split(" ")[0] || "Unknown"
        const lastName = propParticipant.lastName || propParticipant.name?.split(" ").slice(1).join(" ") || ""
        return [
          ...participants,
          {
            id: propParticipant.id || propParticipant.userId || "",
            userId: propParticipant.userId || propParticipant.id || "",
            name: propParticipant.name || `${firstName} ${lastName}`.trim(),
            firstName,
            lastName,
            avatar:
              propParticipant.avatar ||
              `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=10b981&color=fff`,
            status: propParticipant.status || (propParticipant.isOnline ? "online" : "offline"),
            isOnline: propParticipant.isOnline || propParticipant.status === "online",
            email: propParticipant.email || "",
            role: propParticipant.role || role,
          },
        ]
      }
      return participants
    }, [participantsData?.participants, propParticipant, role])

    const groupedMessages = React.useMemo(() => {
      const groups: { [date: string]: IMessage[] } = {}
      localMessages.forEach((message) => {
        const messageDate = message.timestamp || message.createdAt
        const date = new Date(messageDate).toLocaleDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(message)
      })
      return groups
    }, [localMessages])

    // Fallback polling when socket is disconnected
    useEffect(() => {
      if (isConnected) return

      const interval = setInterval(() => {
        refetch()
      }, 5000)

      return () => clearInterval(interval)
    }, [isConnected, refetch])

    if (historyError || participantsError) {
      return (
        <div className="flex-1 flex items-center justify-center bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md"
          >
            <div className="text-5xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Error loading chat</h3>
            <p className="text-slate-600">
              {historyError?.message || participantsError?.message || "Please try again later"}
            </p>
          </motion.div>
        </div>
      )
    }

    if (isLoadingHistory || isLoadingParticipants) {
      return (
        <div className="flex-1 flex items-center justify-center bg-white">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 border-4 border-t-emerald-500 border-emerald-200 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600">Loading messages...</p>
          </motion.div>
        </div>
      )
    }

    if (!participant && !isLoadingParticipants) {
      return (
        <div className="flex-1 flex items-center justify-center bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md"
          >
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No conversation selected</h3>
            <p className="text-slate-600">Select a valid chat from the sidebar to start messaging</p>
          </motion.div>
        </div>
      )
    }

    if (localMessages.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md"
          >
            <div className="text-5xl mb-4">✉️</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No messages yet</h3>
            <p className="text-slate-600">Start the conversation by sending a message</p>
          </motion.div>
        </div>
      )
    }

    const sortedDates = Object.keys(groupedMessages).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })

    return (
      <div ref={containerRef} className="flex-1 p-4 overflow-y-auto bg-slate-50">
        <div className="flex flex-col gap-2 max-w-4xl mx-auto">
          {sortedDates.map((date) => (
            <div key={date} className="mb-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center my-4"
              >
                <div className="bg-white text-slate-600 text-xs px-4 py-1.5 rounded-full shadow-sm border">
                  {formatMessageDate(date)}
                </div>
              </motion.div>
              {groupedMessages[date].map((message, index) => {
                const isCurrentUser = String(message.senderId) === String(currentUserId)
                const messageSender = getMessageSender(String(message.senderId))

                return (
                  <ChatMessage
                    key={`${message.id}-${message.timestamp}`}
                    message={message}
                    sender={messageSender}
                    isCurrentUser={isCurrentUser}
                    showAvatar={shouldShowAvatar(message, index)}
                    onReply={() => onReply(String(message.id))}
                    localMessages={localMessages}
                    participants={allParticipants.map((p: IChatParticipant) => ({
                      id: String(p.id),
                      userId: String(p.userId),
                      name: p.name,
                      firstName: p.name?.split(" ")[0] || p.firstName || "",
                      lastName: p.name?.split(" ").slice(1).join(" ") || p.lastName || "",
                      avatar: p.avatar,
                      status: p.status,
                    }))}
                  />
                )
              })}
            </div>
          ))}

          <AnimatePresence>
            {participant && showTypingIndicator && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TypingIndicator
                  user={{
                    id: String(participant.id || participant.userId || ""),
                    firstName: participant.firstName || participant.name?.split(" ")[0] || "Unknown",
                    lastName: participant.lastName || participant.name?.split(" ").slice(1).join(" ") || "",
                    avatar: participant.avatar || "",
                    isOnline: participant.status === "online",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={scrollToBottom}
                className="fixed bottom-24 right-8 bg-emerald-500 text-white rounded-full p-3 shadow-lg hover:bg-emerald-600 transition-all duration-200 flex items-center justify-center"
                aria-label={`Scroll to bottom${newMessageCount > 0 ? `, ${newMessageCount} new messages` : ""}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && scrollToBottom()}
              >
                {newMessageCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {newMessageCount > 9 ? "9+" : newMessageCount}
                  </span>
                )}
                <ArrowDown size={20} />
              </motion.button>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>
    )
  },
)