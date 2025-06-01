
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { WorkoutType, WORKOUT_TYPES } from "../../../api/src/shared/constants";
import { IPost, UserRole } from "@/types/Post";
import { INotification } from "../types/notification";

interface IPostAuthor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  isTrainer?: boolean;
}

interface IMessage {
  id: string;
  tempId?: string;
  senderId: string;
  receiverId: string;
  text: string;
  status: "SENT" | "DELIVERED" | "READ";
  timestamp: string;
  media?: { type: string; url: string; name?: string };
  replyToId?: string;
  reactions: { userId: string; emoji: string }[];
  deleted: boolean;
  readAt?: string;
  _fromSocket?: boolean;
}

interface ICommunityMessage {
  id: string;
  tempId?: string;
  postId: string;
  authorId: string;
  author: IPostAuthor | null;
  textContent: string;
  mediaUrl?: string;
  createdAt: string;
  role: UserRole;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  messages: IMessage[];
  typingUsers: Map<string, string>;
  userStatus: Map<string, { status: "online" | "offline"; lastSeen?: string }>;
  posts: IPost[];
  communityMessages: ICommunityMessage[];
  notifications: INotification[];
  unreadCount: number;
  sendMessage: (data: {
    senderId: string;
    receiverId: string;
    text?: string;
    media?: { type: "image" | "video" | "file"; url: string; name?: string };
    replyToId?: string;
  }) => void;
  deleteMessage: (messageId: string, receiverId: string) => void;
  addReaction: (messageId: string, emoji: string, receiverId: string) => void;
  removeReaction: (
    messageId: string,
    emoji: string,
    receiverId: string
  ) => void;
  markAsRead: (senderId: string, receiverId: string) => void;
  startTyping: (chatId: string, userId: string) => void;
  stopTyping: (chatId: string, userId: string) => void;
  sendCommunityMessage: (data: {
    postId: string;
    senderId: string;
    text?: string;
    media?: { type: "image" | "video"; url: string; name?: string };
    role: UserRole;
  }) => void;
  clearMessages: () => void;
  clearCommunityMessages: (postId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  userId: string | null;
  role: UserRole | null;
  currentUser: { id: string; role: string } | null;
}

export const SocketProvider = ({
  children,
  userId,
  role,
  currentUser,
}: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map()
  );
  const [userStatus, setUserStatus] = useState<
    Map<string, { status: "online" | "offline"; lastSeen?: string }>
  >(new Map());
  const [posts, setPosts] = useState<IPost[]>([]);
  const [communityMessages, setCommunityMessages] = useState<
    ICommunityMessage[]
  >([]);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const clearMessages = () => {
    console.log("[DEBUG] Clearing socket messages");
    setMessages([]);
  };

  const clearCommunityMessages = (postId: string) => {
    console.log(`[DEBUG] Clearing community messages for post: ${postId}`);
    setCommunityMessages((prev) => prev.filter((msg) => msg.postId !== postId));
  };

  useEffect(() => {
    if (!userId || !role || !["client", "trainer", "admin"].includes(role)) {
      console.warn(
        "[DEBUG] Socket connection skipped: Invalid userId or role",
        { userId, role }
      );
      setError("Invalid userId or role");
      return;
    }

    const socketUrl = import.meta.env.VITE_PRIVATE_API_URL.replace(
      "/api/v1/pvt",
      ""
    );
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 30000,
      auth: {
        userId,
        role,
      },
    });

    newSocket.on("connect", () => {
      console.log("[DEBUG] Client: Socket connected with ID:", newSocket.id);
      setIsConnected(true);
      setError(null);
      newSocket.emit("register", { userId, role });
      newSocket.emit("joinNotificationsRoom", { userId });
      newSocket.emit("getRooms", (rooms: string[]) => {
        console.log("[DEBUG] Client: Rooms after connect:", rooms);
        if (!rooms.includes(`notifications:${userId}`)) {
          console.warn("[DEBUG] Client not in notification room, rejoining...");
          newSocket.emit("joinNotificationsRoom", { userId });
        }
      });
    });

    newSocket.on("disconnect", (reason: string) => {
      setIsConnected(false);
      setError(`Socket disconnected: ${reason}`);
      console.log(`[DEBUG] Socket disconnected: reason=${reason}`);
    });

    newSocket.on("reconnect_attempt", (attempt: number) => {
      console.log(`[DEBUG] Reconnect attempt ${attempt}`);
    });

    newSocket.on("reconnect", (attempt: number) => {
      console.log(`[DEBUG] Reconnected after ${attempt} attempts`);
      newSocket.emit("register", { userId, role });
      newSocket.emit("joinNotificationsRoom", { userId });
      newSocket.emit("getRooms", (rooms: string[]) => {
        console.log("[DEBUG] Client: Rooms after reconnect:", rooms);
      });
    });

    newSocket.on("error", (err: any) => {
      console.error("[DEBUG] Socket error:", err);
      setError(err.message || "Socket error occurred");
    });

    newSocket.on("connectionStatus", (status: {
      isConnected: boolean;
      userId: string;
      role: string;
    }) => {
      console.log("[DEBUG] Connection status:", status);
      setIsConnected(status.isConnected);
      if (!status.isConnected) {
        setError("Connection lost");
      }
    });

    newSocket.on("registerSuccess", ({ userId: registeredUserId }: { userId: string }) => {
      console.log("[DEBUG] Register success:", registeredUserId);
      newSocket.emit("joinUserRoom", { userId: registeredUserId });
      newSocket.emit("joinCommunity", { userId: registeredUserId });
      newSocket.emit("joinNotificationsRoom", { userId: registeredUserId });
      newSocket.emit("getRooms", (rooms: string[]) => {
        console.log("[DEBUG] Client: Rooms after register:", rooms);
      });
    });

    newSocket.on("notification", (notification: INotification) => {
      console.log("[DEBUG] Client: Notification received via socket:", notification);
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    newSocket.on("receiveMessage", (message: IMessage & { tempId?: string }) => {
      console.log("[DEBUG] Received message via socket:", message);
      if (!message.receiverId) {
        console.warn("[DEBUG] Message missing receiverId:", message);
      }

      const standardizedMessage: IMessage = {
        id:
          message.id ||
          `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text || "",
        status: message.status || "SENT",
        timestamp:
          message.timestamp || message.createdAt || new Date().toISOString(),
        media: message.media
          ? {
              type: message.media.type,
              url: message.media.url,
              name: message.media.name,
            }
          : undefined,
        replyToId: message.replyToId,
        reactions: message.reactions || [],
        _fromSocket: true,
        deleted: message.deleted || false,
        readAt: message.readAt,
      };

      setMessages((prev) => {
        const existingIndex = prev.findIndex(
          (m) =>
            String(m.id) === String(standardizedMessage.id) ||
            String(m.tempId) === String(standardizedMessage.id) ||
            String(m.tempId) === String(message.tempId)
        );

        if (existingIndex >= 0) {
          const updatedMessages = [...prev];
          updatedMessages[existingIndex] = standardizedMessage;
          return updatedMessages;
        }
        return [...prev, standardizedMessage];
      });
    });

    newSocket.on("messageDeleted", ({ messageId }: { messageId: string }) => {
      console.log("[DEBUG] Message deleted:", messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(messageId) ? { ...msg, deleted: true } : msg
        )
      );
    });

    newSocket.on("reactionAdded", (message: IMessage) => {
      console.log("[DEBUG] Reaction added event received:", {
        messageId: message.id,
        reactions: message.reactions,
      });
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(message.id)
            ? { ...msg, reactions: message.reactions || [] }
            : msg
        )
      );
    });

    newSocket.on("reactionRemoved", (message: IMessage) => {
      console.log("[DEBUG] Reaction removed event received:", {
        messageId: message.id,
        reactions: message.reactions,
      });
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(message.id)
            ? { ...msg, reactions: message.reactions || [] }
            : msg
        )
      );
    });

    newSocket.on("messagesRead", ({
      senderId,
      receiverId,
    }: {
      senderId: string;
      receiverId: string;
    }) => {
      console.log("[DEBUG] Messages read:", { senderId, receiverId });
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.senderId) === String(senderId) &&
          String(msg.receiverId) === String(receiverId) &&
          msg.status !== "READ"
            ? { ...msg, status: "READ", readAt: new Date().toISOString() }
            : msg
        )
      );
    });

    newSocket.on("typing", ({
      chatId,
      userId,
    }: {
      chatId: string;
      userId: string;
    }) => {
      console.log("[DEBUG] Typing event received:", { chatId, userId });
      setTypingUsers((prev) => new Map(prev).set(userId, chatId));
    });

    newSocket.on("stopTyping", ({
      chatId,
      userId,
    }: {
      chatId: string;
      userId: string;
    }) => {
      console.log("[DEBUG] Stop typing event received:", { chatId, userId });
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    });

    newSocket.on("userStatus", ({
      userId,
      status,
      lastSeen,
    }: {
      userId: string;
      status: "online" | "offline";
      lastSeen?: string;
    }) => {
      console.log("[DEBUG] User status update:", { userId, status, lastSeen });
      setUserStatus((prev) => {
        const newStatus = new Map(prev);
        newStatus.set(userId, { status, lastSeen });
        return newStatus;
      });
    });

    const standardizePost = (post: any): IPost => {
      const author =
        post.author && post.author._id
          ? {
              _id: post.author._id,
              firstName: post.author.firstName || "Unknown",
              lastName: post.author.lastName || "",
              email: post.author.email || "",
              profileImage: post.author.profileImage,
              isTrainer: post.author.isTrainer || post.role === "trainer",
            }
          : null;
      if (!post.author || !post.author._id) {
        console.warn("[DEBUG] Author is missing or incomplete:", {
          postId: post.id,
        });
      }

      const category = WORKOUT_TYPES.includes(post.category as WorkoutType)
        ? (post.category as WorkoutType)
        : "General";
      return {
        id:
          post.id ||
          post.postId ||
          `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        authorId: post.authorId || (author?._id ?? ""),
        author,
        textContent: post.textContent || "",
        mediaUrl: post.mediaUrl,
        category,
        likes: post.likes || [],
        hasLiked:
          post.hasLiked ||
          (post.likes && userId && post.likes.includes(userId)) ||
          false,
        commentCount: post.commentsCount || post.commentCount || 0,
        createdAt: post.createdAt || new Date().toISOString(),
        updatedAt: post.updatedAt || new Date().toISOString(),
        role: (post.role as UserRole) || "client",
        isDeleted: post.isDeleted || false,
        reports: post.reports || [],
      };
    };

    newSocket.on("posts", (posts: any[]) => {
      setPosts(posts.map(standardizePost));
    });

    newSocket.on("newPost", (post: any) => {
      console.log(
        "[DEBUG] Raw newPost event received:",
        JSON.stringify(post, null, 2)
      );
      setPosts((prev) => {
        const standardizedPost = standardizePost(post);
        const existingIndex = prev.findIndex(
          (p) => String(p.id) === String(standardizedPost.id)
        );
        if (existingIndex >= 0) {
          const updatedPosts = [...prev];
          updatedPosts[existingIndex] = standardizedPost;
          return updatedPosts;
        }
        return [...prev, standardizedPost];
      });
    });

    newSocket.on("postDeleted", ({ postId }: { postId: string }) => {
      console.log("[DEBUG] Post deleted:", postId);
      setPosts((prev) =>
        prev.map((post) =>
          String(post.id) === String(postId)
            ? { ...post, isDeleted: true }
            : post
        )
      );
    });

    newSocket.on("postLiked", ({
      postId,
      userId: likerId,
      likes,
      hasLiked,
    }: {
      postId: string;
      userId: string;
      likes: string[];
      hasLiked: boolean;
    }) => {
      console.log("[DEBUG] Post liked event received:", {
        postId,
        likerId,
        likes,
        hasLiked,
      });
      if (!postId || !Array.isArray(likes)) {
        console.error("[DEBUG] Invalid postLiked event data:", {
          postId,
          likes,
          hasLiked,
        });
        return;
      }
      setPosts((prev) => {
        const updatedPosts = prev.map((post) =>
          String(post.id) === String(postId)
            ? { ...post, likes, hasLiked }
            : post
        );
        console.log(
          "[DEBUG] Updated socket posts:",
          updatedPosts.find((p) => p.id === postId)
        );
        return updatedPosts;
      });
    });

    newSocket.on("receiveCommunityMessage", (
      message: ICommunityMessage & { tempId?: string }
    ) => {
      console.log("[DEBUG] Received community message:", message);
      setCommunityMessages((prev) => {
        const existingIndex = prev.findIndex(
          (m) =>
            String(m.id) === String(message.id) ||
            String(m.tempId) === String(message.id) ||
            String(m.tempId) === String(message.tempId)
        );
        if (existingIndex >= 0) {
          const updatedMessages = [...prev];
          updatedMessages[existingIndex] = message;
          return updatedMessages;
        }
        return [...prev, message];
      });
    });

    setSocket(newSocket);

    return () => {
      console.log("[DEBUG] Cleaning up socket connection");
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("reconnect_attempt");
      newSocket.off("reconnect");
      newSocket.off("error");
      newSocket.off("connectionStatus");
      newSocket.off("registerSuccess");
      newSocket.off("notification");
      newSocket.off("receiveMessage");
      newSocket.off("messageDeleted");
      newSocket.off("reactionAdded");
      newSocket.off("reactionRemoved");
      newSocket.off("messagesRead");
      newSocket.off("typing");
      newSocket.off("stopTyping");
      newSocket.off("userStatus");
      newSocket.off("posts");
      newSocket.off("newPost");
      newSocket.off("postDeleted");
      newSocket.off("postLiked");
      newSocket.off("receiveCommunityMessage");
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setMessages([]);
      setPosts([]);
      setCommunityMessages([]);
      setNotifications([]);
      setUnreadCount(0);
      setTypingUsers(new Map());
      setUserStatus(new Map());
      setError(null);
    };
  }, [userId, role]);

  const sendMessage = (data: {
    senderId: string;
    receiverId: string;
    text?: string;
    media?: { type: "image" | "video" | "file"; url: string; name?: string };
    replyToId?: string;
  }) => {
    if (socket && isConnected) {
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const tempMessage: IMessage = {
        id: tempId,
        tempId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text || "",
        status: "SENT",
        timestamp: new Date().toISOString(),
        _fromSocket: true,
        media: data.media
          ? {
              type: data.media.type,
              url: data.media.url,
              name: data.media.name,
            }
          : undefined,
        replyToId: data.replyToId,
        reactions: [],
        deleted: false,
      };
      console.log("[DEBUG] Sending message:", tempMessage);
      setMessages((prev) => [...prev, tempMessage]);
      socket.emit("sendMessage", { ...data, tempId });
    } else {
      setError("Cannot send message - socket not connected");
      console.error("[DEBUG] Cannot send message - socket not connected");
    }
  };

  const deleteMessage = (messageId: string, receiverId: string) => {
    if (socket && isConnected) {
      console.log("[DEBUG] Deleting message:", { messageId, receiverId });
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(messageId) ? { ...msg, deleted: true } : msg
        )
      );
      socket.emit("deleteMessage", { messageId, receiverId });
    } else {
      setError("Cannot delete message - socket not connected");
      console.error("[DEBUG] Cannot delete message - socket not connected");
    }
  };

  const addReaction = (
    messageId: string,
    emoji: string,
    receiverId: string
  ) => {
    if (!userId) {
      setError("Cannot add reaction - userId is not defined");
      console.error("[DEBUG] Cannot add reaction - userId is not defined");
      return;
    }
    if (socket && isConnected) {
      console.log("[DEBUG] Adding reaction:", {
        messageId,
        emoji,
        receiverId,
        userId,
      });
      socket.emit("addReaction", { messageId, emoji, receiverId });
    } else {
      setError("Cannot add reaction - socket not connected");
      console.error("[DEBUG] Cannot add reaction - socket not connected");
    }
  };

  const removeReaction = (
    messageId: string,
    emoji: string,
    receiverId: string
  ) => {
    if (!userId) {
      setError("Cannot remove reaction - userId is not defined");
      console.error("[DEBUG] Cannot remove reaction - userId is not defined");
      return;
    }
    if (socket && isConnected) {
      console.log("[DEBUG] Removing reaction:", {
        messageId,
        emoji,
        receiverId,
        userId,
      });
      socket.emit("removeReaction", { messageId, emoji, receiverId });
    } else {
      setError("Cannot remove reaction - socket not connected");
      console.error("[DEBUG] Cannot remove reaction - socket not connected");
    }
  };

  const markAsRead = (senderId: string, receiverId: string) => {
    if (socket && isConnected) {
      console.log("[DEBUG] Marking messages as read:", {
        senderId,
        receiverId,
      });
      socket.emit("markAsRead", { senderId, receiverId });
    } else {
      setError("Cannot mark as read - socket not connected");
      console.error("[DEBUG] Cannot mark as read - socket not connected");
    }
  };

  const startTyping = (chatId: string, userId: string) => {
    if (socket && isConnected) {
      console.log("[DEBUG] Start typing:", { chatId, userId });
      socket.emit("typing", { chatId, userId });
    } else {
      setError("Cannot start typing - socket not connected");
      console.error("[DEBUG] Cannot start typing - socket not connected");
    }
  };

  const stopTyping = (chatId: string, userId: string) => {
    if (socket && isConnected) {
      console.log("[DEBUG] Stop typing:", { chatId, userId });
      socket.emit("stopTyping", { chatId, userId });
    } else {
      setError("Cannot stop typing - socket not connected");
      console.error("[DEBUG] Cannot stop typing - socket not connected");
    }
  };

  const sendCommunityMessage = (data: {
    postId: string;
    senderId: string;
    text?: string;
    media?: { type: "image" | "video"; url: string; name?: string };
    role: UserRole;
  }) => {
    if (socket && isConnected) {
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const tempMessage: ICommunityMessage = {
        id: tempId,
        tempId,
        postId: data.postId,
        authorId: data.senderId,
        author: null,
        textContent: data.text || (data.media ? "" : ""),
        mediaUrl: data.media ? data.media.url : undefined,
        createdAt: new Date().toISOString(),
        role: data.role,
      };
      console.log("[DEBUG] Sending community message:", tempMessage);
      setCommunityMessages((prev) => [...prev, tempMessage]);
      socket.emit("sendCommunityMessage", { ...data, tempId });
    } else {
      setError("Cannot send community message - socket not connected");
      console.error(
        "[DEBUG] Cannot send community message - socket not connected"
      );
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        error,
        messages,
        typingUsers,
        userStatus,
        posts,
        communityMessages,
        notifications,
        unreadCount,
        sendMessage,
        deleteMessage,
        addReaction,
        removeReaction,
        markAsRead,
        startTyping,
        stopTyping,
        sendCommunityMessage,
        clearMessages,
        clearCommunityMessages,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
