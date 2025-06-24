"use client"

import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRecentChats } from "@/hooks/chat/useChatQueries";
import { ChatHeader } from "./ChatHeader";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import type { UserRole } from "@/types/UserRole";
import { SocketProvider } from "@/context/socketContext";
import { motion, AnimatePresence } from "framer-motion";
import {  IChat, RecentChatsResponse, Participant } from "@/types/Chat";
import { useClientProfile } from "@/hooks/client/useClientProfile";
import { useNavigate } from "react-router-dom";
export default function ChatLayout() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [activeChatParticipantId, setActiveChatParticipantId] = useState<string | null>(null);
  const [activeParticipant, setActiveParticipant] = useState<Participant | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [error, __] = useState<string | null>(null);
  const { client, trainer } = useSelector((state: RootState) => ({
    client: state.client.client,
    trainer: state.trainer.trainer,
  }));
  const { data: clientProfile,  error: profileError } = useClientProfile(client?.id || null);

  const user = client || trainer;
  const role = client ? "client" : trainer ? "trainer" : null;

  const { data: recentChatsData, isLoading } = useRecentChats(role as UserRole);
  const typedRecentChatsData = recentChatsData as RecentChatsResponse | undefined;

  useEffect(() => {
    if (!activeChatParticipantId && typedRecentChatsData?.chats?.length) {
      const firstChat = typedRecentChatsData.chats[0];
      const participantId = firstChat?.participant?.userId;
      if (participantId && firstChat?.participant) {
        setActiveChatParticipantId(participantId);
        setActiveParticipant({
          id: firstChat.participant.id,
          userId: firstChat.participant.userId,
          firstName: firstChat.participant.firstName,
          lastName: firstChat.participant.lastName,
          avatar: firstChat.participant.avatar,
          email: firstChat.participant.email,
          status: firstChat.participant.isOnline ? "online" : "offline",
          isOnline: firstChat.participant.isOnline,
          role: firstChat.participant.role,
        });
      }
    }
  }, [typedRecentChatsData, activeChatParticipantId]);

  useEffect(() => {
    if (activeChatParticipantId && typedRecentChatsData?.chats) {
      const selectedChat = typedRecentChatsData.chats.find(
        (chat: IChat) => chat.participant?.userId === activeChatParticipantId,
      );
      if (selectedChat?.participant) {
        setActiveParticipant({
          id: selectedChat.participant.id,
          userId: selectedChat.participant.userId,
          firstName: selectedChat.participant.firstName,
          lastName: selectedChat.participant.lastName,
          avatar: selectedChat.participant.avatar,
          email: selectedChat.participant.email,
          status: selectedChat.participant.isOnline ? "online" : "offline",
          isOnline: selectedChat.participant.isOnline,
          role: selectedChat.participant.role,
        });
      } else {
        setActiveParticipant(null);
      }
    }
  }, [activeChatParticipantId, typedRecentChatsData]);

  // Handle sidebar toggle
  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleReply = (messageId: string) => {
    setReplyTo(messageId);
  };




  if (profileError || error) {
    return <div className="py-16 text-center text-red-500">{profileError?.message || error || "Error loading data"}</div>;
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
    );
  }

  if (role === "client" && clientProfile && (!clientProfile.isPremium || clientProfile.selectStatus !== "accepted")) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Premium Feature</h2>
          <p className="text-slate-600 mb-4">Please select a trainer and upgrade to premium to access chat features</p>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors" onClick={() => navigate("/premium")}>
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-emerald-500 border-emerald-200 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider
      userId={user.id}
      role={role}
      currentUser={user ? { id: user.id, role: role || '' } : null}
    >
      <div className="fixed inset-0 pt-16 bg-slate-50">
        <div className="flex h-full w-full overflow-hidden">
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
                    participant={activeParticipant || {
                      id: activeChatParticipantId,
                      userId: activeChatParticipantId,
                      firstName: "Unknown",
                      lastName: "User",
                      email: "",
                      role: role as UserRole,
                      isOnline: false,
                      avatar: `https://ui-avatars.com/api/?name=Unknown+User&background=10b981&color=fff`,
                    }}
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
  );
}