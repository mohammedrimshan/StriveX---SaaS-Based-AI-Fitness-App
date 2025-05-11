import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { connect, Socket } from 'socket.io-client';
import { UserRole } from '@/types/UserRole';
import { IMessage } from '@/types/Chat';

interface IPostAuthor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface IPost {
  id: string;
  authorId: string;
  author: IPostAuthor | null; // Align with backend: author can be null
  textContent: string;
  mediaUrl?: string;
  category: string;
  likes: string[];
  commentsCount: number;
  createdAt: string;
  role: string; // 'client', 'trainer', or 'admin'
  isDeleted: boolean;
}

interface ICommunityMessage {
  id: string;
  postId: string;
  authorId: string;
  textContent: string;
  mediaUrl?: string;
  createdAt: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: IMessage[];
  typingUsers: Set<string>;
  userStatus: Map<string, { status: 'online' | 'offline'; lastSeen?: string }>;
  posts: IPost[];
  communityMessages: ICommunityMessage[];
  sendMessage: (data: {
    senderId: string;
    receiverId: string;
    text?: string;
    media?: { type: 'image' | 'video' | 'file'; base64: string; name?: string };
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
    media?: { type: 'image' | 'video'; base64: string; name?: string };
    role: string;
  }) => void;
  clearMessages: () => void;
  clearCommunityMessages: (postId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
  userId: string | null;
  role: UserRole | null;
}

export const SocketProvider = ({ children, userId, role }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [userStatus, setUserStatus] = useState<Map<string, { status: 'online' | 'offline'; lastSeen?: string }>>(new Map());
  const [posts, setPosts] = useState<IPost[]>([]);
  const [communityMessages, setCommunityMessages] = useState<ICommunityMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clearMessages = () => {
    console.log('Clearing socket messages');
    setMessages([]);
  };

  const clearCommunityMessages = (postId: string) => {
    console.log(`Clearing community messages for post: ${postId}`);
    setCommunityMessages(prev => prev.filter(msg => msg.postId !== postId));
  };

  useEffect(() => {
    if (!userId || !role || !['client', 'trainer', 'admin'].includes(role)) {
      console.warn('Socket connection skipped: Invalid userId or role', { userId, role });
      return;
    }

    const socketUrl = import.meta.env.VITE_PRIVATE_API_URL.replace('/api/v1/pvt', '');
    const options = {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    };

    const newSocket = connect(socketUrl, options);

    const onConnect = () => {
      setIsConnected(true);
      setError(null);
      newSocket.emit('register', { userId, role }, (response: any) => {
        console.log('Register response:', response);
      });
      console.log('Socket connected:', newSocket.id, 'Registered with:', { userId, role });
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setError('Socket disconnected');
      console.log('Socket disconnected');
    };

    const onError = (error: any) => {
      console.error('Socket error:', error);
      setError(error.message || 'Socket error occurred');
    };

    const onReceiveMessage = (message: IMessage) => {
      console.log('Received message via socket:', message);
      if (!message.receiverId) {
        console.warn('Message missing receiverId:', message);
      }

      const standardizedMessage: IMessage = {
        id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text || '',
        status: message.status || 'SENT',
        timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
        media: message.media ? {
          type: message.media.type,
          url: message.media.url,
          name: message.media.name
        } : undefined,
        replyToId: message.replyToId,
        reactions: message.reactions || [],
        _fromSocket: true,
        deleted: message.deleted || false,
        readAt: message.readAt,
      };

      setMessages(prev => {
        const existingIndex = prev.findIndex(m =>
          String(m.id) === String(standardizedMessage.id) ||
          String(m.tempId) === String(standardizedMessage.id)
        );

        if (existingIndex >= 0) {
          const updatedMessages = [...prev];
          updatedMessages[existingIndex] = standardizedMessage;
          return updatedMessages;
        }

        return [...prev, standardizedMessage];
      });
    };

    const onMessageDeleted = ({ messageId }: { messageId: string }) => {
      console.log('Message deleted:', messageId);
      setMessages(prev =>
        prev.map(msg =>
          String(msg.id) === String(messageId) ? { ...msg, deleted: true } : msg
        )
      );
    };

    const onReactionAdded = (message: IMessage) => {
      console.log('Reaction added event received:', { messageId: message.id, reactions: message.reactions });
      setMessages(prev =>
        prev.map(msg =>
          String(msg.id) === String(message.id)
            ? { ...msg, reactions: message.reactions || [] }
            : msg
        )
      );
    };

    const onReactionRemoved = (message: IMessage) => {
      console.log('Reaction removed event received:', { messageId: message.id, reactions: message.reactions });
      setMessages(prev =>
        prev.map(msg =>
          String(msg.id) === String(message.id)
            ? { ...msg, reactions: message.reactions || [] }
            : msg
        )
      );
    };

    const onMessagesRead = ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
      console.log('Messages read:', { senderId, receiverId });
      setMessages(prev =>
        prev.map(msg =>
          String(msg.senderId) === String(senderId) && String(msg.receiverId) === String(receiverId) && msg.status !== 'READ'
            ? { ...msg, status: 'READ', readAt: new Date().toISOString() }
            : msg
        )
      );
    };

    const onTyping = ({ chatId, userId }: { chatId: string; userId: string }) => {
      console.log('Typing event received:', userId);
      setTypingUsers(prev => new Set(prev).add(userId));
    };

    const onStopTyping = ({ chatId, userId }: { chatId: string; userId: string }) => {
      console.log('Stop typing event received:', userId);
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    };

    const onUserStatus = ({ userId, status, lastSeen }: { userId: string; status: 'online' | 'offline'; lastSeen?: string }) => {
      console.log('User status update:', { userId, status, lastSeen });
      setUserStatus(prev => {
        const newStatus = new Map(prev);
        newStatus.set(userId, { status, lastSeen });
        return newStatus;
      });
    };

    // Standardize post data from socket events
    const standardizePost = (post: any): IPost => {
      console.log('Standardizing post:', post);
      return {
        id: post.id,
        authorId: post.authorId,
        author: post.author
          ? {
              _id: post.author._id,
              firstName: post.author.firstName,
              lastName: post.author.lastName,
              email: post.author.email,
              profileImage: post.author.profileImage,
            }
          : null,
        textContent: post.textContent,
        mediaUrl: post.mediaUrl,
        category: post.category,
        likes: post.likes || [],
        commentsCount: post.commentsCount || 0,
        createdAt: post.createdAt,
        role: post.role,
        isDeleted: post.isDeleted || false,
      };
    };

    const onInitialPosts = (posts: any[]) => {
      console.log('Initial posts received:', posts);
      setPosts(posts.map(standardizePost));
    };

    const onNewPost = (post: any) => {
      console.log('New post received:', post);
      setPosts(prev => {
        const standardizedPost = standardizePost(post);
        console.log('Standardized post:', standardizedPost);
        const existingIndex = prev.findIndex(p => String(p.id) === String(standardizedPost.id));
        if (existingIndex >= 0) {
          const updatedPosts = [...prev];
          updatedPosts[existingIndex] = standardizedPost;
          return updatedPosts;
        }
        return [...prev, standardizedPost];
      });
    };

    const onPostDeleted = ({ postId }: { postId: string }) => {
      console.log('Post deleted:', postId);
      setPosts(prev =>
        prev.map(post =>
          String(post.id) === String(postId) ? { ...post, isDeleted: true } : post
        )
      );
    };

    const onPostLiked = ({ postId, userId, likes }: { postId: string; userId: string; likes: string[] }) => {
      console.log('Post liked:', { postId, userId, likes });
      setPosts(prev =>
        prev.map(post =>
          String(post.id) === String(postId) ? { ...post, likes } : post
        )
      );
    };

    const onReceiveCommunityMessage = (message: ICommunityMessage) => {
      console.log('Received community message:', message);
      setCommunityMessages(prev => {
        const existingIndex = prev.findIndex(m => String(m.id) === String(message.id));
        if (existingIndex >= 0) {
          const updatedMessages = [...prev];
          updatedMessages[existingIndex] = message;
          return updatedMessages;
        }
        return [...prev, message];
      });
    };

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('error', onError);
    newSocket.on('receiveMessage', onReceiveMessage);
    newSocket.on('messageDeleted', onMessageDeleted);
    newSocket.on('reactionAdded', onReactionAdded);
    newSocket.on('reactionRemoved', onReactionRemoved);
    newSocket.on('messagesRead', onMessagesRead);
    newSocket.on('typing', onTyping);
    newSocket.on('stopTyping', onStopTyping);
    newSocket.on('userStatus', onUserStatus);
    newSocket.on('posts', onInitialPosts);
    newSocket.on('newPost', onNewPost);
    newSocket.on('postDeleted', onPostDeleted);
    newSocket.on('postLiked', onPostLiked);
    newSocket.on('receiveCommunityMessage', onReceiveCommunityMessage);

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.off('error', onError);
      newSocket.off('receiveMessage', onReceiveMessage);
      newSocket.off('messageDeleted', onMessageDeleted);
      newSocket.off('reactionAdded', onReactionAdded);
      newSocket.off('reactionRemoved', onReactionRemoved);
      newSocket.off('messagesRead', onMessagesRead);
      newSocket.off('typing', onTyping);
      newSocket.off('stopTyping', onStopTyping);
      newSocket.off('userStatus', onUserStatus);
      newSocket.off('posts', onInitialPosts);
      newSocket.off('newPost', onNewPost);
      newSocket.off('postDeleted', onPostDeleted);
      newSocket.off('postLiked', onPostLiked);
      newSocket.off('receiveCommunityMessage', onReceiveCommunityMessage);
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setMessages([]);
      setPosts([]);
      setCommunityMessages([]);
      setTypingUsers(new Set());
      setUserStatus(new Map());
    };
  }, [userId, role]);

  const sendMessage = (data: {
    senderId: string;
    receiverId: string;
    text?: string;
    media?: { type: 'image' | 'video' | 'file'; base64: string; name?: string };
    replyToId?: string;
  }) => {
    if (socket && isConnected) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempMessage: IMessage = {
        id: tempId,
        tempId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text || '',
        status: 'SENT',
        timestamp: new Date().toISOString(),
        _fromSocket: true,
        media: data.media ? {
          type: data.media.type,
          url: '',
          name: data.media.name
        } : undefined,
        replyToId: data.replyToId,
        reactions: [],
        deleted: false,
      };

      console.log('Sending message:', tempMessage);
      setMessages(prev => [...prev, tempMessage]);
      socket.emit('sendMessage', { ...data, tempId });
    } else {
      setError('Cannot send message - socket not connected');
      console.error('Cannot send message - socket not connected');
    }
  };

  const deleteMessage = (messageId: string, receiverId: string) => {
    if (socket && isConnected) {
      console.log('Deleting message:', { messageId, receiverId });
      setMessages(prev =>
        prev.map(msg =>
          String(msg.id) === String(messageId) ? { ...msg, deleted: true } : msg
        )
      );
      socket.emit('deleteMessage', { messageId, receiverId });
    } else {
      setError('Cannot delete message - socket not connected');
      console.error('Cannot delete message - socket not connected');
    }
  };

  const addReaction = (messageId: string, emoji: string, receiverId: string) => {
    if (!userId) {
      setError('Cannot add reaction - userId is not defined');
      console.error('Cannot add reaction - userId is not defined');
      return;
    }
    if (socket && isConnected) {
      console.log('Adding reaction:', { messageId, emoji, receiverId, userId });
      socket.emit('addReaction', { messageId, emoji, receiverId });
    } else {
      setError('Cannot add reaction - socket not connected');
      console.error('Cannot add reaction - socket not connected');
    }
  };

  const removeReaction = (messageId: string, emoji: string, receiverId: string) => {
    if (!userId) {
      setError('Cannot remove reaction - userId is not defined');
      console.error('Cannot remove reaction - userId is not defined');
      return;
    }
    if (socket && isConnected) {
      console.log('Removing reaction:', { messageId, emoji, receiverId, userId });
      socket.emit('removeReaction', { messageId, emoji, receiverId });
    } else {
      setError('Cannot remove reaction - socket not connected');
      console.error('Cannot remove reaction - socket not connected');
    }
  };

  const markAsRead = (senderId: string, receiverId: string) => {
    if (socket && isConnected) {
      console.log('Marking messages as read:', { senderId, receiverId });
      socket.emit('markAsRead', { senderId, receiverId });
    } else {
      setError('Cannot mark as read - socket not connected');
      console.error('Cannot mark as read - socket not connected');
    }
  };

  const startTyping = (chatId: string, userId: string) => {
    if (socket && isConnected) {
      console.log('Start typing:', { chatId, userId });
      socket.emit('typing', { chatId, userId });
    } else {
      setError('Cannot start typing - socket not connected');
      console.error('Cannot start typing - socket not connected');
    }
  };

  const stopTyping = (chatId: string, userId: string) => {
    if (socket && isConnected) {
      console.log('Stop typing:', { chatId, userId });
      socket.emit('stopTyping', { chatId, userId });
    } else {
      setError('Cannot stop typing - socket not connected');
      console.error('Cannot stop typing - socket not connected');
    }
  };

  const sendCommunityMessage = (data: {
    postId: string;
    senderId: string;
    text?: string;
    media?: { type: 'image' | 'video'; base64: string; name?: string };
    role: string;
  }) => {
    if (socket && isConnected) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempMessage: ICommunityMessage = {
        id: tempId,
        postId: data.postId,
        authorId: data.senderId,
        textContent: data.text || (data.media ? '' : ''),
        mediaUrl: data.media ? '' : undefined,
        createdAt: new Date().toISOString(),
      };

      console.log('Sending community message:', tempMessage);
      setCommunityMessages(prev => [...prev, tempMessage]);
      socket.emit('sendCommunityMessage', data);
    } else {
      setError('Cannot send community message - socket not connected');
      console.error('Cannot send community message - socket not connected');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        messages,
        typingUsers,
        userStatus,
        posts,
        communityMessages,
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
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};