"use client"

import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { useRecentChats } from "@/hooks/chat/useChatQueries"
import { ChatHeader } from "./ChatHeader"
import { ChatSidebar } from "./chat-sidebar"
import { ChatMessages } from "./ChatMessages"
import { ChatInput } from "./ChatInput"
import type { UserRole } from "@/types/UserRole"
import { SocketProvider } from "@/context/socketContext"
import { motion, AnimatePresence } from "framer-motion"

// Define Participant interface for type safety
interface Participant {
  userId: string
  firstName?: string
  lastName?: string
  name?: string
  avatar?: string
  status?: "online" | "offline"
}

export function ChatLayout() {
  const isMobile = useIsMobile()
  const [showSidebar, setShowSidebar] = useState(!isMobile)
  const [activeChatParticipantId, setActiveChatParticipantId] = useState<string | null>(null)
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const { client, trainer } = useSelector((state: RootState) => ({
    client: state.client.client,
    trainer: state.trainer.trainer,
  }))
  const user = client || trainer
  const role = client ? "client" : trainer ? "trainer" : null

  const { data: recentChatsData, isLoading } = useRecentChats(role as UserRole)

  // Select first chat and set participant details
  useEffect(() => {
    if (!activeChatParticipantId && recentChatsData?.chats?.length) {
      const firstChat = recentChatsData.chats[0]
      // Check if firstChat has participant property before accessing userId
      const participantId = firstChat?.participant?.userId || firstChat?.participant?.id

      if (participantId) {
        setActiveChatParticipantId(participantId)
        setActiveParticipant(firstChat.participant)
      }
    }
  }, [recentChatsData, activeChatParticipantId])

  // Update active participant when activeChatParticipantId changes
  useEffect(() => {
    if (activeChatParticipantId && recentChatsData?.chats) {
      const selectedChat = recentChatsData.chats.find(
        (chat: any) =>
          chat.participant &&
          (chat.participant.userId === activeChatParticipantId || chat.participant.id === activeChatParticipantId),
      )
      setActiveParticipant(selectedChat?.participant || null)
    }
  }, [activeChatParticipantId, recentChatsData])

  // Handle sidebar toggle
  useEffect(() => {
    setShowSidebar(!isMobile)
  }, [isMobile])

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const handleReply = (messageId: string) => {
    setReplyTo(messageId)
  }

  if (!user || !role) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome to Chat</h2>
          <p className="text-slate-600">Please log in to start messaging</p>
        </div>
      </div>
    )
  }

  if (role === "client" && client && (!client.isPremium || client.selectStatus !== "accepted")) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Premium Feature</h2>
          <p className="text-slate-600 mb-4">Please select a trainer and upgrade to premium to access chat features</p>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-emerald-500 border-emerald-200 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <SocketProvider userId={user.id} role={role}>
      {/* Fixed position container that accounts for top navbar (mt-16) */}
      <div className="fixed inset-0 pt-16 bg-slate-50">
        <div className="flex h-full w-full overflow-hidden">
          {/* Sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={isMobile ? { x: -300, opacity: 0 } : { opacity: 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={isMobile ? { x: -300, opacity: 0 } : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`${isMobile ? "absolute inset-y-0 left-0 z-20 w-80" : "w-80"} bg-white shadow-lg`}
              >
                <ChatSidebar
                  role={role as UserRole}
                  currentUserId={user.id}
                  isMobile={isMobile}
                  onClose={isMobile ? () => setShowSidebar(false) : undefined}
                  onSelectChat={setActiveChatParticipantId}
                  activeChatParticipantId={activeChatParticipantId}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeChatParticipantId ? (
              <>
                <ChatHeader
                  participantId={activeChatParticipantId}
                  role={role as UserRole}
                  onToggleSidebar={toggleSidebar}
                  showSidebar={showSidebar}
                />
                <div className="flex-1 overflow-hidden flex flex-col">
                  <ChatMessages
                    participantId={activeChatParticipantId}
                    participant={activeParticipant || undefined}
                    role={role as UserRole}
                    currentUserId={user.id}
                    onReply={handleReply}
                  />
                  <div className="mt-auto">
                    <ChatInput
                      participantId={activeChatParticipantId}
                      role={role as UserRole}
                      currentUserId={user.id}
                      replyToMessageId={replyTo}
                      onCancelReply={() => setReplyTo(null)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-white">
                <div className="text-center p-8 max-w-md">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 mb-6">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-2">Start a Conversation</h2>
                  <p className="text-slate-600 mb-6">Select a chat from the sidebar to begin messaging</p>
                  {isMobile && !showSidebar && (
                    <button
                      onClick={toggleSidebar}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      View Conversations
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SocketProvider>
  )
}