"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ImageIcon, Video, File, Smile, X, MessageSquareHeart, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/context/socketContext";
import { useChatHistory, useChatParticipants } from "@/hooks/chat/useChatQueries";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Textarea } from "@/components/ui/textarea";
import type { UserRole } from "@/types/UserRole";
import type { ChatHistoryResponse, ChatParticipantsResponse, IMessage, IChatParticipant } from "@/types/Chat";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const uploadToCloudinary = async (
  file: File,
  folder: string,
  resourceType: "image" | "video" | "raw" | "auto"
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "edusphere");
  formData.append("folder", folder);

  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "strivex";
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) throw new Error("Upload failed");
    const data = await response.json();
    return data.secure_url;
  } catch (error: any) {
    throw error;
  }
};

interface ChatInputProps {
  participantId: string;
  role: UserRole;
  currentUserId: string;
  replyToMessageId: string | null;
  onCancelReply: () => void;
}

export function ChatInput({ participantId, role, currentUserId, replyToMessageId, onCancelReply }: ChatInputProps) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{
    type: "image" | "video" | "file";
    url: string;
    name?: string;
    size?: number;
  } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { sendMessage, startTyping, stopTyping } = useSocket();
  const { data: chatHistoryData, isLoading: historyLoading, error: historyError } = useChatHistory(
    role,
    participantId,
  ) as {
    data: ChatHistoryResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  const { data: participantsData, isLoading: participantsLoading, error: participantsError } = useChatParticipants(
    role,
  ) as {
    data: ChatParticipantsResponse | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  // Focus textarea when replying
  useEffect(() => {
    if (replyToMessageId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyToMessageId]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const replyMessage = replyToMessageId
    ? chatHistoryData?.messages?.find((m: IMessage) => m.id === replyToMessageId)
    : null;
  const replyToSender = replyMessage
    ? participantsData?.participants?.find((p: IChatParticipant) => p.userId === replyMessage.senderId)
    : null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      let resourceType: "image" | "video" | "raw" | "auto";
      let mediaType: "image" | "video" | "audio" | "file";

      if (file.type.startsWith("image/")) {
        resourceType = "image";
        mediaType = "image";
      } else if (file.type.startsWith("video/")) {
        resourceType = "video";
        mediaType = "video";
      } else if (file.type === "application/pdf") {
        resourceType = "raw";
        mediaType = "file";
      } else {
        throw new Error("Unsupported file type");
      }

      const url = await uploadToCloudinary(file, "chat_uploads", resourceType);

      setPreviewMedia({
        type: mediaType,
        url,
        name: file.name,
        size: file.size,
      });
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = () => {
    if (!text.trim() && !previewMedia) return;

    const messageData = {
      senderId: currentUserId,
      receiverId: participantId,
      text: text.trim() || undefined,
      media: previewMedia
        ? {
            type: previewMedia.type,
            url: previewMedia.url,
            name: previewMedia.name,
          }
        : undefined,
      replyToId: replyToMessageId || undefined,
    };

    sendMessage(messageData);
    setText("");
    setPreviewMedia(null);
    stopTyping(`${currentUserId}_${participantId}`, currentUserId);
    onCancelReply();
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    const chatId = `${currentUserId}_${participantId}`;
    if (value.trim().length > 0) {
      startTyping(chatId, currentUserId);
    } else {
      stopTyping(chatId, currentUserId);
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setText((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  // Render loading or error states after all hooks
  if (historyLoading || participantsLoading) {
    return (
      <div className="p-5 border-t bg-white/90 backdrop-blur-sm sticky bottom-0 rounded-b-2xl text-center">
        Loading...
      </div>
    );
  }

  if (historyError || participantsError) {
    return (
      <div className="p-5 border-t bg-white/90 backdrop-blur-sm sticky bottom-0 rounded-b-2xl text-center text-red-600">
        Error loading chat data
      </div>
    );
  }

  return (
    <div className="p-5 border-t bg-white/90 backdrop-blur-sm sticky bottom-0 rounded-b-2xl">
      <AnimatePresence>
        {replyToMessageId && replyMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mb-3 bg-white p-3 rounded-lg flex items-start border border-indigo-100 shadow-sm"
          >
            <div className="flex-1">
              <div className="text-indigo-700 font-medium text-sm flex items-center gap-1">
                <MessageSquareHeart size={16} />
                <span>
                  Replying to {`${replyToSender?.firstName || "Unknown"} ${replyToSender?.lastName || ""}`.trim()}
                </span>
              </div>
              <div className="text-sm truncate text-gray-600">{replyMessage.text}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCancelReply}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewMedia && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mb-3 bg-white p-3 rounded-lg flex items-start border border-indigo-100 shadow-sm"
          >
            <div className="flex-1 flex items-center gap-2">
              {previewMedia.type === "image" && (
                <img
                  src={previewMedia.url || "/placeholder.svg"}
                  alt="Preview"
                  className="h-20 w-auto rounded-md object-cover"
                />
              )}
              {previewMedia.type === "video" && (
                <video src={previewMedia.url} className="h-20 w-auto rounded-md" controls />
              )}
              {previewMedia.type === "file" && (
                <div className="flex items-center gap-2">
                  <File size={28} className="text-indigo-700" />
                  <div className="text-sm truncate">{previewMedia.name}</div>
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPreviewMedia(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 relative">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              ref={emojiPickerRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-2 right-0 z-10"
            >
              <div className="shadow-xl rounded-lg border border-indigo-100 overflow-hidden">
                <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 text-gray-500 hover:text-indigo-700 rounded-full hover:bg-indigo-50 transition-colors shadow-sm"
            aria-label="Add emoji"
          >
            <Smile size={24} />
          </motion.button>

          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 hover:text-indigo-700 rounded-full hover:bg-indigo-50 transition-colors shadow-sm"
              aria-label="Upload file"
            >
              <Paperclip size={24} />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-0 mb-2 hidden group-hover:flex flex-col bg-white shadow-lg rounded-lg p-2 border border-indigo-100"
            >
              <motion.button
                whileHover={{ backgroundColor: "#f3f4f6" }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-sm"
              >
                <ImageIcon size={18} className="text-indigo-700" />
                <span>Image</span>
              </motion.button>
              <motion.button
                whileHover={{ backgroundColor: "#f3f4f6" }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-sm"
              >
                <Video size={18} className="text-indigo-700" />
                <span>Video</span>
              </motion.button>
              <motion.button
                whileHover={{ backgroundColor: "#f3f4f6" }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-sm"
              >
                <File size={18} className="text-indigo-700" />
                <span>File</span>
              </motion.button>
            </motion.div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*,application/pdf"
          />
        </div>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full resize-none rounded-2xl border border-indigo-200 focus:border-indigo-400 focus:ring-indigo-200 p-4 pr-12 max-h-32 overflow-auto shadow-sm bg-white"
            placeholder="Type a message..."
            rows={1}
            style={{ height: Math.min(24 + (text.split("\n").length - 1) * 20, 120) + "px" }}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={(!text.trim() && !previewMedia) || uploading}
          className={cn(
            "p-3 rounded-full flex items-center justify-center shadow-md",
            (!text.trim() && !previewMedia) || uploading
              ? "bg-gray-200 text-gray-400"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700",
          )}
        >
          {uploading ? (
            <div className="h-6 w-6 border-2 border-t-transparent border-white rounded-full animate-spin" />
          ) : (
            <Send size={24} />
          )}
        </motion.button>
      </div>
    </div>
  );
}