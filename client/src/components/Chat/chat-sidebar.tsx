"use client";

import { useState, useMemo } from "react";
import { Search, MessageCircle, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useRecentChats, useChatParticipants } from "@/hooks/chat/useChatQueries";
import { ChatSidebarItem } from "./chat-sidebar-item";
import { UserAvatar } from "./user-avatar";
import { useSocket } from "@/context/socketContext";
import type { UserRole } from "@/types/UserRole";
import type { ChatParticipantsResponse, IChat, IChatParticipant, RecentChatsResponse } from "@/types/Chat";
import { motion } from "framer-motion";

interface ChatSidebarProps {
  role: UserRole;
  currentUserId: string;
  isMobile?: boolean;
  onClose?: () => void;
  onSelectChat: (participantId: string) => void;
  activeChatParticipantId: string | null;
}

export function ChatSidebar({
  role,
  currentUserId,
  isMobile = false,
  onClose,
  onSelectChat,
  activeChatParticipantId,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);
  const { data: recentChatsData } = useRecentChats(role);
  const { data: participantsData } = useChatParticipants(role);
  const { userStatus } = useSocket();

  const { client, trainer } = useSelector((state: RootState) => ({
    client: state.client.client,
    trainer: state.trainer.trainer,
  }));
  const currentUser = client || trainer;

  if (!currentUser) return null;

  // Merge userStatus with participantsData for real-time status
const enrichedParticipants = useMemo(() => {
  if (!participantsData || !(participantsData as unknown as ChatParticipantsResponse).participants) return [];
  return (participantsData as unknown as ChatParticipantsResponse).participants.map(
    (participant: IChatParticipant) => {
      const statusInfo = userStatus.get(participant.userId);
      return {
        ...participant,
        isOnline: statusInfo ? statusInfo.status === "online" : participant.isOnline,
        lastSeen: statusInfo?.lastSeen,
      };
    }
  );
}, [participantsData, userStatus]);

  // Merge userStatus with recentChatsData for real-time status
const enrichedChats = useMemo(() => {
  if (!recentChatsData || !(recentChatsData as unknown as RecentChatsResponse).chats) return [];
  return (recentChatsData as unknown as RecentChatsResponse).chats.map((chat: IChat) => {
    if (!chat.participant) return chat;
    const statusInfo = userStatus.get(chat.participant.userId);
    return {
      ...chat,
      participant: {
        ...chat.participant,
        isOnline: statusInfo ? statusInfo.status === "online" : chat.participant.isOnline,
        lastSeen: statusInfo?.lastSeen,
      },
    };
  });
}, [recentChatsData, userStatus]);

  // Filter chats based on search query
  const filteredChats = useMemo(
    () =>
      enrichedChats.filter((chat: IChat) => {
        const participant = chat?.participant;
        if (!participant) return false;

        const participantName = [participant.firstName, participant.lastName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const hasMatchingName = participantName.includes(searchQuery.toLowerCase());
        const hasMatchingMessages = chat.lastMessage?.text
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

        return hasMatchingName || hasMatchingMessages;
      }),
    [enrichedChats, searchQuery]
  );

  // Filter participants based on search query
  const filteredParticipants = useMemo(
    () =>
      enrichedParticipants.filter((participant: IChatParticipant) =>
        `${participant.firstName} ${participant.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [enrichedParticipants, searchQuery]
  );

  // Sort chats: unread first, then by last message timestamp
  const sortedChats = useMemo(
    () =>
      [...filteredChats].sort((a: IChat, b: IChat) => {
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
        if (!a.lastMessage && b.lastMessage) return 1;
        if (a.lastMessage && !b.lastMessage) return -1;
        if (!a.lastMessage && !b.lastMessage) return 0;
        return new Date(b.lastMessage!.createdAt).getTime() - new Date(a.lastMessage!.createdAt).getTime();
      }),
    [filteredChats]
  );

  return (
    <div className="w-full h-full flex flex-col border-r bg-white">
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center gap-3 mb-4">
          <UserAvatar
            user={{
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              avatar: currentUser.profileImage || "",
              isOnline: userStatus.get(currentUser.id)?.status === "online" || true,
            }}
            size="lg"
            className="ring-2 ring-purple-200 ring-offset-2"
          />
          <div>
            <h2 className="font-bold text-purple-800">{`${currentUser.firstName} ${currentUser.lastName}`}</h2>
            <p className="text-sm text-gray-600">Online</p>
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search"
            className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowParticipants(false)}
            className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 transition-all duration-200 ${
              !showParticipants
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            <MessageCircle size={16} />
            Chats
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowParticipants(true)}
            className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 transition-all duration-200 ${
              showParticipants
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            <Users size={16} />
            New Chat
          </motion.button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {showParticipants ? (
          filteredParticipants.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg m-2 p-4">
              <Users size={40} className="mx-auto mb-2 text-gray-400" />
              <p className="font-medium">No participants found</p>
            </div>
          ) : (
            filteredParticipants.map((participant: IChatParticipant) => (
              <motion.div
                key={participant.userId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelectChat(participant.userId);
                  if (isMobile && onClose) onClose();
                }}
                className="flex p-3 gap-3 cursor-pointer rounded-lg hover:bg-gray-100 m-1 border border-gray-100 transition-all duration-200"
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
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium truncate text-gray-800">{`${participant.firstName} ${participant.lastName}`}</h3>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          participant.isOnline ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></span>
                      {participant.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )
        ) : sortedChats.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg m-2 p-4">
            <MessageCircle size={40} className="mx-auto mb-2 text-gray-400" />
            <p className="font-medium">No chats found</p>
            <p className="text-sm mt-1">Start a new conversation</p>
          </div>
        ) : (
          sortedChats.map((chat: IChat) => (
            <ChatSidebarItem
              key={chat.chatId}
              chat={chat}
              currentUserId={currentUserId}
              isActive={activeChatParticipantId === chat.participant?.userId}
              onClick={() => {
                onSelectChat(chat.participant?.userId);
                if (isMobile && onClose) onClose();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}