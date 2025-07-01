import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import io from "socket.io-client";
import { Socket } from "socket.io-client";
import { IPost, UserRole } from "@/types/Post";
import { INotification } from "../types/notification";


export const WORKOUT_TYPES = [
  "Yoga",
  "Cardio",
  "WeightTraining",
  "Meditation",
  "Calisthenics",
  "Pilates",
  "General",
] as const;
export type WorkoutType = (typeof WORKOUT_TYPES)[number];
interface IPostAuthor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  isTrainer?: boolean;
}

interface IMessage {
  createdAt: string;
  updatedAt: string;
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
  removeReaction: (messageId: string, emoji: string, receiverId: string) => void;
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
}: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [userStatus, setUserStatus] = useState<Map<string, { status: "online" | "offline"; lastSeen?: string }>>(new Map());
  const [posts, setPosts] = useState<IPost[]>([]);
  const [communityMessages, setCommunityMessages] = useState<ICommunityMessage[]>([]);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const clearMessages = () => {
    console.log("[DEBUG] Client: Clearing socket messages", { timestamp: new Date().toISOString() });
    setMessages([]);
  };

  const clearCommunityMessages = (postId: string) => {
    console.log("[DEBUG] Client: Clearing community messages for post", { postId, timestamp: new Date().toISOString() });
    setCommunityMessages((prev) => prev.filter((msg) => msg.postId !== postId));
  };

  useEffect(() => {
    if (!userId || !role || !["client", "trainer", "admin"].includes(role)) {
      console.warn("[DEBUG] Client: Socket connection skipped: Invalid userId or role", {
        userId,
        role,
        timestamp: new Date().toISOString(),
      });
      setError("Invalid userId or role");
      return;
    }

    const socketUrl = "https://api.strivex.rimshan.in"; // Replace with your actual socket URL

    console.log(socketUrl, "Socket URL");
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 30000,
      auth: { userId, role },
    });

    newSocket.on("connect", () => {
      console.log("[DEBUG] Client: Socket connected", {
        socketId: newSocket.id,
        userId,
        role,
        timestamp: new Date().toISOString(),
      });
      setIsConnected(true);
      setError(null);
      newSocket.emit("register", { userId, role });
      newSocket.emit("joinNotificationsRoom", { userId });
      newSocket.emit("getRooms", (rooms: string[]) => {
        console.log("[DEBUG] Client: Current rooms", {
          rooms,
          expectedRoom: `notifications:${userId}`,
          inRoom: rooms.includes(`notifications:${userId}`),
          timestamp: new Date().toISOString(),
        });
        if (!rooms.includes(`notifications:${userId}`)) {
          console.warn("[DEBUG] Client: Not in notification room, rejoining", {
            timestamp: new Date().toISOString(),
          });
          newSocket.emit("joinNotificationsRoom", { userId });
        }
      });
    });

    newSocket.on("registerSuccess", ({ userId: registeredUserId }: { userId: string }) => {
      console.log("[DEBUG] Client: Register success", {
        registeredUserId,
        timestamp: new Date().toISOString(),
      });
      newSocket.emit("joinUserRoom", { userId: registeredUserId });
      newSocket.emit("joinCommunity", { userId: registeredUserId });
      newSocket.emit("joinNotificationsRoom", { userId: registeredUserId });
      newSocket.emit("getRooms", (rooms: string[]) => {
        console.log("[DEBUG] Client: Rooms after register", {
          rooms,
          timestamp: new Date().toISOString(),
        });
        if (!rooms.includes(`notifications:${registeredUserId}`) || !rooms.includes(`user:${registeredUserId}`)) {
          console.warn("[DEBUG] Client: Missing expected rooms, rejoining", {
            timestamp: new Date().toISOString(),
          });
          newSocket.emit("joinNotificationsRoom", { userId: registeredUserId });
          newSocket.emit("joinUserRoom", { userId: registeredUserId });
        }
      });
    });

    newSocket.on("disconnect", (reason: string) => {
      console.log("[DEBUG] Client: Socket disconnected", {
        reason,
        timestamp: new Date().toISOString(),
      });
      setIsConnected(false);
      setError(`Socket disconnected: ${reason}`);
    });

    newSocket.on("reconnect_attempt", (attempt: number) => {
      console.log("[DEBUG] Client: Reconnect attempt", {
        attempt,
        timestamp: new Date().toISOString(),
      });
    });

    newSocket.on("reconnect", (attempt: number) => {
      console.log("[DEBUG] Client: Socket reconnected", {
        attempt,
        userId,
        timestamp: new Date().toISOString(),
      });
      newSocket.emit("register", { userId, role });
      newSocket.emit("joinNotificationsRoom", { userId });
      newSocket.emit("getRooms", (rooms: string[]) => {
        console.log("[DEBUG] Client: Rooms after reconnect", {
          rooms,
          timestamp: new Date().toISOString(),
        });
      });
    });

    newSocket.on("error", (err: any) => {
      console.error("[DEBUG] Client: Socket error", {
        error: err.message || "Unknown error",
        timestamp: new Date().toISOString(),
      });
      setError(err.message || "Socket error occurred");
    });

    newSocket.on("connectionStatus", (status: {
      isConnected: boolean;
      userId: string;
      role: string;
    }) => {
      console.log("[DEBUG] Client: Connection status", {
        status,
        timestamp: new Date().toISOString(),
      });
      setIsConnected(status.isConnected);
      if (!status.isConnected) {
        setError("Connection lost");
      }
    });

    newSocket.on("notification", (notification: INotification) => {
      console.log("[DEBUG] Client: Notification received via socket", {
        notification: JSON.stringify(notification, null, 2),
        timestamp: new Date().toISOString(),
      });
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) {
          console.log("[DEBUG] Client: Duplicate notification ignored", {
            id: notification.id,
            timestamp: new Date().toISOString(),
          });
          return prev;
        }
        console.log("[DEBUG] Client: Adding new notification", {
          id: notification.id,
          timestamp: new Date().toISOString(),
        });
        return [notification, ...prev];
      });
      if (!notification.isRead) {
        setUnreadCount((prev) => {
          const newCount = prev + 1;
          console.log("[DEBUG] Client: Incrementing unread count", {
            newCount,
            timestamp: new Date().toISOString(),
          });
          return newCount;
        });
      }
    });

    newSocket.on("receiveMessage", (message: IMessage & { tempId?: string }) => {
      console.log("[DEBUG] Client: Received message via socket", {
        message,
        timestamp: new Date().toISOString(),
      });
      if (!message.receiverId) {
        console.warn("[DEBUG] Client: Message missing receiverId", {
          message,
          timestamp: new Date().toISOString(),
        });
      }

      const standardizedMessage: IMessage = {
        id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text || "",
        status: message.status || "SENT",
        timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
        media: message.media ? { type: message.media.type, url: message.media.url, name: message.media.name } : undefined,
        replyToId: message.replyToId,
        reactions: message.reactions || [],
        _fromSocket: true,
        deleted: message.deleted || false,
        readAt: message.readAt,
        createdAt: "",
        updatedAt: ""
      };

      setMessages((prev) => {
        const existingIndex = prev.findIndex(
          (m) => String(m.id) === String(standardizedMessage.id) || String(m.tempId) === String(standardizedMessage.id) || String(m.tempId) === String(message.tempId)
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
      console.log("[DEBUG] Client: Message deleted", {
        messageId,
        timestamp: new Date().toISOString(),
      });
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(messageId) ? { ...msg, deleted: true } : msg
        )
      );
    });

    newSocket.on("reactionAdded", (message: IMessage) => {
      console.log("[DEBUG] Client: Reaction added event received", {
        messageId: message.id,
        reactions: message.reactions,
        timestamp: new Date().toISOString(),
      });
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(message.id) ? { ...msg, reactions: message.reactions || [] } : msg
        )
      );
    });

    newSocket.on("reactionRemoved", (message: IMessage) => {
      console.log("[DEBUG] Client: Reaction removed event received", {
        messageId: message.id,
        reactions: message.reactions,
        timestamp: new Date().toISOString(),
      });
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(message.id) ? { ...msg, reactions: message.reactions || [] } : msg
        )
      );
    });

    newSocket.on("messagesRead", ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
      console.log("[DEBUG] Client: Messages read", {
        senderId,
        receiverId,
        timestamp: new Date().toISOString(),
      });
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.senderId) === String(senderId) && String(msg.receiverId) === String(receiverId) && msg.status !== "READ"
            ? { ...msg, status: "READ", readAt: new Date().toISOString() } : msg
        )
      );
    });

    newSocket.on("typing", ({ chatId, userId }: { chatId: string; userId: string }) => {
      console.log("[DEBUG] Client: Typing event received", {
        chatId,
        userId,
        timestamp: new Date().toISOString(),
      });
      setTypingUsers((prev) => new Map(prev).set(userId, chatId));
    });

    newSocket.on("stopTyping", ({ chatId, userId }: { chatId: string; userId: string }) => {
      console.log("[DEBUG] Client: Stop typing event received", {
        chatId,
        userId,
        timestamp: new Date().toISOString(),
      });
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    });

    newSocket.on("userStatus", ({ userId, status, lastSeen }: { userId: string; status: "online" | "offline"; lastSeen?: string }) => {
      console.log("[DEBUG] Client: User status update", {
        userId,
        status,
        lastSeen,
        timestamp: new Date().toISOString(),
      });
      setUserStatus((prev) => {
        const newStatus = new Map(prev);
        newStatus.set(userId, { status, lastSeen });
        return newStatus;
      });
    });

    const standardizePost = (post: any): IPost => {
      const author = post.author && post.author._id
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
        console.warn("[DEBUG] Client: Author is missing or incomplete", {
          postId: post.id,
          timestamp: new Date().toISOString(),
        });
      }

      const category = WORKOUT_TYPES.includes(post.category as WorkoutType) ? (post.category as WorkoutType) : "General";
      return {
        id: post.id || post.postId || `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        authorId: post.authorId || (author?._id ?? ""),
        author: author
    ? {
        ...author,
        id: author._id, // ✅ Add this to match IPostAuthor
      }
    : null,
        textContent: post.textContent || "",
        content: post.textContent || "",
        mediaUrl: post.mediaUrl,
        category,
        likes: post.likes || [],
        hasLiked: post.hasLiked || (post.likes && userId && post.likes.includes(userId)) || false,
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
      console.log("[DEBUG] Client: Raw newPost event received", {
        post: JSON.stringify(post, null, 2),
        timestamp: new Date().toISOString(),
      });
      setPosts((prev) => {
        const standardizedPost = standardizePost(post);
        const existingIndex = prev.findIndex((p) => String(p.id) === String(standardizedPost.id));
        if (existingIndex >= 0) {
          const updatedPosts = [...prev];
          updatedPosts[existingIndex] = standardizedPost;
          return updatedPosts;
        }
        return [standardizedPost, ...prev];
      });
    });

    newSocket.on("postDeleted", ({ postId }: { postId: string }) => {
      console.log("[DEBUG] Client: Post deleted", {
        postId,
        timestamp: new Date().toISOString(),
      });
      setPosts((prev) => {
        return prev.map((post) => String(post.id) === String(postId) ? { ...post, isDeleted: true } : post
        );
      });
    });

    newSocket.on("postLiked", ({ postId, userId: likerId, likes, hasLiked }: { postId: string; userId: string; likes: string[]; hasLiked: boolean }) => {
  console.log("[DEBUG] Client: Post liked event received", {
    postId,
    likerId,
    likes,
    hasLiked,
    timestamp: new Date().toISOString(),
  });
  if (!postId || !Array.isArray(likes)) {
    console.error("[DEBUG] Client: Invalid postLiked event data", {
      postId,
      likes,
      hasLiked,
      timestamp: new Date().toISOString(),
    });
    return;
  }
  setPosts((prev) => {
    const updatedPosts = prev.map((post) =>
      String(post.id) === String(postId)
        ? { ...post, likes, hasLiked: likes.includes(userId) }
        : post
    );
    console.log("[DEBUG] Client: Updated socket posts", {
      updatedPost: updatedPosts.find((p) => p.id === postId),
      timestamp: new Date().toISOString(),
    });
    return updatedPosts;
  });
});

    newSocket.on("receiveCommunityMessage", (message: ICommunityMessage & { tempId?: string }) => {
      console.log("[DEBUG] Client: Received community message", {
        message,
        timestamp: new Date().toISOString(),
      });
      setCommunityMessages((prev) => {
        const existingIndex = prev.findIndex(
          (m) => String(m.id) === String(message.id) || String(m.tempId) === String(message.id) || String(m.tempId) === String(message.tempId)
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
      console.log("[DEBUG] Client: Cleaning up socket connection", {
        timestamp: new Date().toISOString(),
      });
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
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempMessage: IMessage = {
        id: tempId,
        tempId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text || "",
        status: "SENT",
        timestamp: new Date().toISOString(),
        _fromSocket: true,
        media: data.media ? { type: data.media.type, url: data.media.url, name: data.media.name } : undefined,
        replyToId: data.replyToId,
        reactions: [],
        deleted: false,
        createdAt: "",
        updatedAt: ""
      };
      console.log("[DEBUG] Client: Sending message", {
        tempMessage,
        timestamp: new Date().toISOString(),
      });
      setMessages((prev) => [...prev, tempMessage]);
      socket.emit("sendMessage", { ...data, tempId });
    } else {
      setError("Cannot send message - socket not connected");
      console.error("[DEBUG] Client: Cannot send message - socket not connected", {
        timestamp: new Date().toISOString(),
      });
    }
  };

  const deleteMessage = (messageId: string, receiverId: string) => {
    if (socket && isConnected) {
      console.log("[DEBUG] Client: Deleting message", {
        messageId,
        receiverId,
        timestamp: new Date().toISOString(),
      });
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id) === String(messageId) ? { ...msg, deleted: true } : msg
        )
      );
      socket.emit("deleteMessage", { messageId, receiverId });
    } else {
      setError("Cannot delete message - socket not connected");
      console.error("[DEBUG] Client: Cannot delete message - socket not connected", {
        timestamp: new Date().toISOString(),
      });
    }
  };

  const addReaction = (messageId: string, emoji: string, receiverId: string) => {
    if (!userId) {
      setError("Cannot add reaction - userId is not defined");
      console.error("[DEBUG] Client: Cannot add reaction - userId is not defined", {
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (socket && isConnected) {
      console.log("[DEBUG] Client: Adding reaction", {
        messageId,
        emoji,
        receiverId,
        userId,
        timestamp: new Date().toISOString(),
      });
      socket.emit("addReaction", { messageId, emoji, receiverId });
    } else {
      setError("Cannot add reaction - socket not connected");
      console.error("[DEBUG] Client: Cannot add reaction - socket not connected", {
        timestamp: new Date().toISOString(),
      });
    }
  };

  const removeReaction = (messageId: string, emoji: string, receiverId: string) => {
    if (!userId) {
      setError("Cannot remove reaction - userId is not defined");
      console.error("[DEBUG] Client: Cannot remove reaction - userId is not defined", {
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (socket && isConnected) {
      console.log("[DEBUG] Client: Removing reaction", {
        messageId,
        emoji,
        receiverId,
        userId,
        timestamp: new Date().toISOString(),
      });
      socket.emit("removeReaction", { messageId, emoji, receiverId });
    } else {
      setError("Cannot remove reaction - socket not connected");
      console.error("[DEBUG] Client: Cannot remove reaction - socket not connected", {
        timestamp: new Date().toISOString(),
      });
    }
  };

  const markAsRead = (senderId: string, receiverId: string) => {
    if (socket && isConnected) {
      console.log("[DEBUG] Client: Marking messages as read", {
        senderId,
        receiverId,
        timestamp: new Date().toISOString(),
      });
      socket.emit("markAsRead", { senderId, receiverId });
    } else {
      setError("Cannot mark as read - socket not connected");
      console.error("[DEBUG] Client: Cannot mark as read - socket not connected", {
        timestamp: new Date().toISOString(),
      });
    }
  };

  const startTyping = (chatId: string, userId: string) => {
    if (socket && isConnected) {
      console.log("[DEBUG] Client: Start typing", {
        chatId,
        userId,
        timestamp: new Date().toISOString(),
      });
      socket.emit("typing", { chatId, userId });
    } else {
      setError("Cannot start typing - socket not connected");
      console.error("[DEBUG] Client: Cannot start typing - socket not connected", {
        timestamp: new Date().toISOString(),
      });
    }
  };

  const stopTyping = (chatId: string, userId: string) => {
    if (socket && isConnected) {
      console.log("[DEBUG] Client: Stop typing", {
        chatId,
        userId,
        timestamp: new Date().toISOString(),
      });
      socket.emit("stopTyping", { chatId, userId });
    } else {
      setError("Cannot stop typing - socket not connected");
      console.error("[DEBUG] Client: Cannot stop typing - socket not connected", {
        timestamp: new Date().toISOString(),
      });
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
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
      console.log("[DEBUG] Client: Sending community message", {
        tempMessage,
        timestamp: new Date().toISOString(),
      });
      setCommunityMessages((prev) => [...prev, tempMessage]);
      socket.emit("sendCommunityMessage", { ...data, tempId });
    } else {
      setError("Cannot send community message - socket not connected");
      console.error("[DEBUG] Client: Cannot send community message - socket not connected", {
        timestamp: new Date().toISOString(),
      });
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