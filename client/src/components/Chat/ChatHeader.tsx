"use client";

import { Menu, Phone, Video, MoreHorizontal, X } from "lucide-react";
import { useChatParticipants } from "@/hooks/chat/useChatQueries";
import { useSocket } from "@/context/socketContext";
import { UserAvatar } from "./user-avatar";
import type { UserRole } from "@/types/UserRole";
import type { ChatParticipantsResponse, IChatParticipant } from "@/types/Chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface ChatHeaderProps {
  participantId: string;
  role: UserRole;
  onToggleSidebar?: () => void;
  showSidebar?: boolean;
}

export function ChatHeader({ participantId, role, onToggleSidebar, showSidebar }: ChatHeaderProps) {
  const { data: participantsData, isLoading, error } = useChatParticipants(role);
  const { userStatus } = useSocket();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading participant data</div>;

  const participant = (participantsData as ChatParticipantsResponse)?.participants?.find(
    (p: IChatParticipant) => p.userId === participantId
  );

  if (!participant) return null;

  // Merge participant with real-time userStatus
  const enrichedParticipant: IChatParticipant = {
    ...participant,
    isOnline: userStatus.get(participantId)?.status === "online" || participant.isOnline,
    lastSeen: userStatus.get(participantId)?.lastSeen || participant.lastSeen,
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return "recently";

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return lastSeenDate.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10 border-b border-slate-200"
    >
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
          aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
        >
          {showSidebar ? <X size={22} /> : <Menu size={22} />}
        </motion.button>
        <UserAvatar
          user={{
            id: enrichedParticipant.userId,
            firstName: enrichedParticipant.firstName,
            lastName: enrichedParticipant.lastName,
            avatar: enrichedParticipant.avatar || "",
            isOnline: enrichedParticipant.isOnline,
            lastSeen: enrichedParticipant.lastSeen,
          }}
          size="md"
          className="ring-2 ring-emerald-100 ring-offset-2"
        />
        <div>
          <h3 className="font-semibold text-slate-800">{`${enrichedParticipant.firstName} ${enrichedParticipant.lastName}`}</h3>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <motion.span
              animate={
                enrichedParticipant.isOnline
                  ? { scale: [1, 1.2, 1], backgroundColor: "#10b981" }
                  : { backgroundColor: "#9ca3af" }
              }
              transition={{
                duration: 2,
                repeat: enrichedParticipant.isOnline ? Number.POSITIVE_INFINITY : 0,
                repeatDelay: 1,
              }}
              className="inline-block w-2 h-2 rounded-full"
            ></motion.span>
            {enrichedParticipant.isOnline
              ? "Active now"
              : `Last seen ${formatLastSeen(enrichedParticipant.lastSeen)}`}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-slate-100 text-slate-700 p-2 rounded-full transition-colors"
          aria-label="Voice call"
        >
          <Phone size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-slate-100 text-slate-700 p-2 rounded-full transition-colors"
          aria-label="Video call"
        >
          <Video size={20} />
        </motion.button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-100 text-slate-700 p-2 rounded-full transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal size={20} />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 animate-in fade-in-80 zoom-in-95">
            <DropdownMenuItem className="cursor-pointer py-2">View Profile</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2">Search in Conversation</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2">Mute Notifications</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-500 py-2">Block User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}