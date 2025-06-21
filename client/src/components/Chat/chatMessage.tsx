"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { Check, CheckCheck, Reply, Trash2, SmilePlus, Download } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { ChatMessageProps } from "@/types/Chat"
import { useSocket } from "@/context/socketContext"
import { useDeleteMessage } from "@/hooks/chat/useChatQueries"
import type { UserRole } from "@/types/UserRole"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


export const ChatMessage = React.memo(
  ({ message, sender, isCurrentUser, onReply, localMessages, participants }: ChatMessageProps) => {
    const [showActions, setShowActions] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { addReaction, removeReaction, deleteMessage: socketDeleteMessage } = useSocket();
    const { mutate: deleteMessage } = useDeleteMessage("client" as UserRole);
    const participantId = isCurrentUser ? String(message.receiverId) : String(message.senderId);
    const [currentUserReactions, setCurrentUserReactions] = useState<{ [emoji: string]: boolean }>({});
    const actionRef = useRef<HTMLDivElement>(null);

    const replyToMessage = message.replyToId
      ? localMessages.find((msg) => String(msg.id) === String(message.replyToId))
      : undefined;

    const replyToSender = replyToMessage
      ? participants.find(
          (p) =>
            String(p.userId) === String(replyToMessage.senderId) || String(p.id) === String(replyToMessage.senderId),
        )
      : undefined;

    const getReplyToSenderName = () => {
      if (!replyToMessage) return "Unknown User";

      if (replyToSender) {
        const firstName = replyToSender.firstName || replyToSender.name?.split(" ")[0] || "";
        const lastName = replyToSender.lastName || replyToSender.name?.split(" ").slice(1).join(" ") || "";
        return `${firstName} ${lastName}`.trim() || "Unknown User";
      }

      if (replyToMessage.senderName) {
        return replyToMessage.senderName;
      }

      return "You";
    };

    const formattedTime =
      new Date(message.createdAt || message.timestamp || 0).getHours().toString().padStart(2, "0") +
      ":" +
      new Date(message.createdAt || message.timestamp || 0).getMinutes().toString().padStart(2, "0");

    const emojis = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

    const handleReactionClick = useCallback(
      (emoji: string) => {
        const hasReacted = currentUserReactions[emoji];
        console.log('Reaction clicked:', {
          messageId: message.id,
          emoji,
          hasReacted,
          participantId,
          action: hasReacted ? 'remove' : 'add',
        });
        
        setCurrentUserReactions((prev) => ({
          ...prev,
          [emoji]: !hasReacted,
        }));
        
        if (hasReacted) {
          removeReaction(String(message.id), emoji, participantId);
        } else {
          addReaction(String(message.id), emoji, participantId);
        }
        setShowEmojiPicker(false);
      },
      [message.id, currentUserReactions, participantId, addReaction, removeReaction],
    );

    useEffect(() => {
      if (!message.reactions) {
        setCurrentUserReactions({});
        return;
      }
      
      const userReactions: { [emoji: string]: boolean } = {};
      const currentUserId = isCurrentUser ? String(message.senderId) : String(participantId);
      
      // message.reactions.forEach((reaction) => {
      //   userReactions[reaction.emoji] = reaction.users.includes(currentUserId);
      // });
      
      console.log('Updated currentUserReactions:', {
        messageId: message.id,
        userId: currentUserId,
        reactions: userReactions,
        rawReactions: message.reactions,
      });
      
      setCurrentUserReactions(userReactions);
    }, [message.reactions, isCurrentUser, message.senderId, participantId, message.id]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
          setShowEmojiPicker(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = () => {
      console.log("Deleting message:", { messageId: message.id, participantId });
      if (message.id.startsWith("temp-")) {
        socketDeleteMessage(String(message.id), participantId);
      } else {
        deleteMessage({ messageId: String(message.id), participantId });
      }
    };

    const isPdfUrl = (url: string) => {
      return (
        url?.toLowerCase().endsWith(".pdf") ||
        (url?.toLowerCase().includes("cloudinary") && url?.toLowerCase().includes(".pdf"))
      );
    };

    const getFilenameFromUrl = (url: string) => {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split("/").pop() || "document.pdf";
        return filename;
      } catch (e) {
        return "document.pdf";
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn("flex w-full gap-2 mb-1.5 group relative", isCurrentUser ? "justify-end" : "justify-start")}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {!isCurrentUser && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 self-end"
          >
            <img
              src={sender.avatar || "/placeholder.svg"}
              alt={`${sender.firstName} ${sender.lastName}`}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
            />
          </motion.div>
        )}
        <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start", "max-w-[65%]")}>
          {!isCurrentUser && (
            <div className="text-xs text-slate-500 mb-0.5 ml-1 font-medium">
              {`${sender.firstName} ${sender.lastName}`}
            </div>
          )}

          {message.replyToId && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "rounded-t-md px-2 py-0.5 text-xs mb-0.5 max-w-[90%] border-l-2",
                isCurrentUser
                  ? "bg-slate-100 text-slate-600 rounded-tr-none self-end border-emerald-400"
                  : "bg-slate-100 rounded-tl-none border-slate-300",
              )}
            >
              {replyToMessage ? (
                <>
                  <div className="font-medium">{getReplyToSenderName()}</div>
                  <div className="truncate">{replyToMessage.text || "Message not found"}</div>
                </>
              ) : (
                <div className="text-slate-500 italic">Replied message not available</div>
              )}
            </motion.div>
          )}

          <div className={cn("relative")}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className={cn(
                isCurrentUser
                  ? "bg-emerald-500 text-white rounded-lg rounded-br-none"
                  : "bg-white text-slate-800 rounded-lg rounded-bl-none",
                "px-3 py-2 min-w-[100px] pb-4 shadow-sm hover:shadow transition-all duration-200 border border-slate-100",
              )}
            >
              {message.deleted ? (
                <i className="text-slate-400 text-sm">This message was deleted</i>
              ) : (
                <>
                  {message.media && message.media.type === "image" && (
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      src={message.media.url || "/placeholder.svg"}
                      alt="Image"
                      className="rounded-md mb-1.5 max-h-48 w-auto object-cover"
                    />
                  )}
                  {message.media && message.media.type === "video" && (
                    <video src={message.media.url} controls className="rounded-md mb-1.5 max-h-48 w-auto" />
                  )}
                  {message.media && message.media.type === "file" && (
                    <div className="bg-white bg-opacity-20 p-2 rounded-md mb-1.5 flex items-center gap-2 border border-white/20">
                      {isPdfUrl(message.media.url) ? (
                        <a
                          href={message.media.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full"
                        >
                          <div className="p-1 bg-red-100 rounded-md">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-red-600"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium truncate">{getFilenameFromUrl(message.media.url)}</div>
                            <div className="text-xs text-slate-400">PDF</div>
                          </div>
                          <Download size={14} className={isCurrentUser ? "text-white/80" : "text-slate-500"} />
                        </a>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                          <div className="text-xs truncate">{message.media.url}</div>
                        </>
                      )}
                    </div>
                  )}
                  <p className={cn("whitespace-pre-wrap mb-3 text-sm", isCurrentUser ? "text-white" : "text-slate-800")}>
                    {message.text}
                  </p>
                  <div
                    className={cn(
                      "message-time flex items-center gap-1 absolute bottom-1 text-xs font-medium",
                      isCurrentUser ? "right-3 text-white/80" : "left-3 text-slate-500",
                      "whitespace-nowrap",
                    )}
                  >
                    <span>{formattedTime}</span>
                    {isCurrentUser &&
                      (message.status === "READ" ? (
                        <CheckCheck size={10} className="text-blue-300" />
                      ) : (
                        <Check size={10} />
                      ))}
                  </div>
                </>
              )}
            </motion.div>

            <AnimatePresence>
              {showActions && !message.deleted && (
                <motion.div
                  ref={actionRef}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "absolute -top-8 flex bg-white shadow-md rounded-full p-0.5 gap-0.5 z-10",
                    isCurrentUser ? "right-2" : "left-10",
                  )}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="hover:bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                          aria-label="Add reaction"
                        >
                          <SmilePlus size={14} className="text-slate-600" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add reaction</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={onReply}
                          className="hover:bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                          aria-label="Reply"
                        >
                          <Reply size={14} className="text-slate-600" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Reply</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {isCurrentUser && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDelete}
                            className="hover:bg-red-50 text-red-500 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "absolute -top-16 flex bg-white shadow-md rounded-full p-0.5 gap-0.5 z-20 border border-slate-100",
                    isCurrentUser ? "right-2" : "left-10",
                  )}
                >
                  {emojis.map((emoji) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReactionClick(emoji)}
                      className={cn(
                        "hover:bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors",
                        currentUserReactions[emoji] && "bg-emerald-100",
                      )}
                      aria-label={`${currentUserReactions[emoji] ? "Remove" : "Add"} ${emoji} reaction`}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {message.reactions && message.reactions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn("flex flex-wrap gap-1 mt-0.5", isCurrentUser ? "justify-end" : "justify-start")}
            >
              {message.reactions.map((reaction, index) => (
                <motion.div
                  key={`${reaction.emoji}-${index}`}
                  whileHover={{ scale: 1.05 }}
                  className={cn(
                    "bg-white shadow-sm rounded-full px-1.5 py-0.5 text-xs flex items-center gap-1 hover:shadow transition-all duration-200 border border-slate-100",
                    currentUserReactions[reaction.emoji] && "bg-emerald-50 border-emerald-100",
                  )}
                  onClick={() => handleReactionClick(reaction.emoji)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleReactionClick(reaction.emoji)}
                >
                  <span>{reaction.emoji}</span>
                  {/* <span className="text-slate-500 text-[10px] font-medium">{reaction.users.length}</span> */}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {isCurrentUser && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 self-end"
          >
            <img
              src={sender.avatar || "/placeholder.svg"}
              alt={`${sender.firstName} ${sender.lastName}`}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
            />
          </motion.div>
        )}
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    const prevReactions = JSON.stringify(prevProps.message.reactions || []);
    const nextReactions = JSON.stringify(nextProps.message.reactions || []);
    
    return (
      String(prevProps.message.id) === String(nextProps.message.id) &&
      prevProps.message.text === nextProps.message.text &&
      prevReactions === nextReactions &&
      String(prevProps.message.replyToId) === String(nextProps.message.replyToId) &&
      prevProps.message.status === nextProps.message.status &&
      prevProps.isCurrentUser === nextProps.isCurrentUser &&
      String(prevProps.sender.id) === String(nextProps.sender.id)
    );
  },
);