import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { connect, Socket } from 'socket.io-client';
import { UserRole } from '@/types/UserRole';
import { IMessage } from '@/types/Chat';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: IMessage[];
  typingUsers: Set<string>;
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
  clearMessages: () => void;
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

  const clearMessages = () => {
    console.log('Clearing socket messages');
    setMessages([]);
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
      newSocket.emit('register', { userId, role }, (response: any) => {
        console.log('Register response:', response);
      });
      console.log('Socket connected:', newSocket.id, 'Registered with:', { userId, role });
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    };

    const onError = (error: Error) => {
      console.error('Socket error:', error);
    };

    const onReceiveMessage = (message: IMessage) => {
      console.log('Received message via socket:', message);
      if (!message.receiverId) {
        console.warn('Message missing receiverId:', message);
      }

      if (!message.timestamp && message.createdAt) {
        message.timestamp = message.createdAt;
      }

      const messageWithId = {
        ...message,
        id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      setMessages(prev => {
        const existingIndex = prev.findIndex(m =>
          String(m.id) === String(messageWithId.id) ||
          String(m.tempId) === String(messageWithId.id)
        );

        console.log('Existing message index:', existingIndex, 'Message ID:', messageWithId.id);

        if (existingIndex >= 0) {
          const updatedMessages = [...prev];
          updatedMessages[existingIndex] = {
            ...messageWithId,
            _fromSocket: true
          };
          console.log('Updated existing message:', updatedMessages[existingIndex]);
          return updatedMessages;
        }

        const newMessages = [...prev, { ...messageWithId, _fromSocket: true }];
        console.log('Added new message:', messageWithId);
        return newMessages;
      });
    };

    const onMessageDeleted = ({ messageId }: { messageId: string }) => {
      console.log('Message deleted:', messageId);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, deleted: true } : msg
        )
      );
    };

    const onReactionAdded = (data: { messageId: string, emoji: string, userId: string }) => {
      console.log('Reaction added event received:', data);
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === data.messageId) {
            const currentReactions = msg.reactions || [];
            const existingReactionIndex = currentReactions.findIndex(r => r.emoji === data.emoji);
            let updatedReactions;

            if (existingReactionIndex > -1) {
              updatedReactions = [...currentReactions];
              const reaction = updatedReactions[existingReactionIndex];
              const users = Array.isArray(reaction?.users) ? reaction.users : [];
              if (!users.includes(data.userId)) {
                updatedReactions[existingReactionIndex] = {
                  ...reaction,
                  users: [...users, data.userId]
                };
              }
            } else {
              updatedReactions = [
                ...currentReactions,
                {
                  emoji: data.emoji,
                  users: [data.userId]
                }
              ];
            }

            console.log('Updated reactions:', updatedReactions);
            return {
              ...msg,
              reactions: updatedReactions
            };
          }
          return msg;
        });
      });
    };

    const onReactionRemoved = (data: { messageId: string, emoji: string, userId: string }) => {
      console.log('Reaction removed event received:', data);
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === data.messageId && msg.reactions) {
            const reactionIndex = msg.reactions.findIndex(r => r.emoji === data.emoji);
            if (reactionIndex > -1) {
              const reaction = msg.reactions[reactionIndex];
              const users = Array.isArray(reaction.users) ? reaction.users : [reaction.users].filter(Boolean);
              const updatedUsers = users.filter(user => user !== data.userId);
              let updatedReactions;

              if (updatedUsers.length === 0) {
                updatedReactions = msg.reactions.filter((_, index) => index !== reactionIndex);
              } else {
                updatedReactions = [...msg.reactions];
                updatedReactions[reactionIndex] = {
                  ...reaction,
                  users: updatedUsers
                };
              }

              return {
                ...msg,
                reactions: updatedReactions
              };
            }
          }
          return msg;
        });
      });
    };

    const onMessagesRead = ({ senderId, receiverId }: { senderId: string; receiverId: string }) => {
      console.log('Messages read:', { senderId, receiverId });
      setMessages(prev =>
        prev.map(msg =>
          msg.senderId === senderId && msg.receiverId === receiverId && msg.status !== 'READ'
            ? { ...msg, status: 'READ', readAt: new Date().toISOString() }
            : msg
        )
      );
    };

    const onTyping = ({ userId }: { userId: string }) => {
      console.log('Typing event received:', userId);
      setTypingUsers(prev => new Set(prev).add(userId));
    };

    const onStopTyping = ({ userId }: { userId: string }) => {
      console.log('Stop typing event received:', userId);
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
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
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setMessages([]);
      setTypingUsers(new Set());
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
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        _fromSocket: true,
        ...(data.media && { media: data.media }),
        ...(data.replyToId && { replyToId: data.replyToId }),
      };

      console.log('Sending message:', tempMessage);
      setMessages(prev => [...prev, tempMessage]);
      socket.emit('sendMessage', { ...data, tempId });
    } else {
      console.error('Cannot send message - socket not connected');
    }
  };

  const deleteMessage = (messageId: string, receiverId: string) => {
    if (socket && isConnected) {
      console.log('Deleting message:', { messageId, receiverId });
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, deleted: true } : msg
        )
      );
      socket.emit('deleteMessage', { messageId, receiverId });
    } else {
      console.error('Cannot delete message - socket not connected');
    }
  };

  const addReaction = (messageId: string, emoji: string, receiverId: string) => {
    if (!userId) {
      console.error('Cannot add reaction - userId is not defined');
      return;
    }
    if (socket && isConnected) {
      console.log('Adding reaction:', { messageId, emoji, receiverId });
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === messageId) {
            const reactions = msg.reactions || [];
            const existingReactionIndex = reactions.findIndex(r => r.emoji === emoji);
            let updatedReactions;
            if (existingReactionIndex > -1) {
              updatedReactions = [...reactions];
              const reaction = updatedReactions[existingReactionIndex];
              const users = Array.isArray(reaction.users) ? reaction.users : [reaction.users].filter(Boolean);
              if (!users.includes(userId)) {
                updatedReactions[existingReactionIndex] = {
                  ...reaction,
                  users: [...users, userId]
                };
              }
            } else {
              updatedReactions = [
                ...reactions,
                {
                  emoji,
                  users: [userId]
                }
              ];
            }
            return {
              ...msg,
              reactions: updatedReactions
            };
          }
          return msg;
        });
      });
      socket.emit('addReaction', { messageId, emoji, receiverId });
    } else {
      console.error('Cannot add reaction - socket not connected');
    }
  };

  const removeReaction = (messageId: string, emoji: string, receiverId: string) => {
    if (!userId) {
      console.error('Cannot remove reaction - userId is not defined');
      return;
    }
    if (socket && isConnected) {
      console.log('Removing reaction:', { messageId, emoji, receiverId });
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === messageId && msg.reactions) {
            const reactionIndex = msg.reactions.findIndex(r => r.emoji === emoji);
            if (reactionIndex > -1) {
              const reaction = msg.reactions[reactionIndex];
              const users = Array.isArray(reaction.users) ? reaction.users : [reaction.users].filter(Boolean);
              const updatedUsers = users.filter(user => user !== userId);
              let updatedReactions;
              if (updatedUsers.length === 0) {
                updatedReactions = msg.reactions.filter((_, index) => index !== reactionIndex);
              } else {
                updatedReactions = [...msg.reactions];
                updatedReactions[reactionIndex] = {
                  ...reaction,
                  users: updatedUsers
                };
              }
              return {
                ...msg,
                reactions: updatedReactions
              };
            }
          }
          return msg;
        });
      });
      socket.emit('removeReaction', { messageId, emoji, receiverId });
    } else {
      console.error('Cannot remove reaction - socket not connected');
    }
  };

  const markAsRead = (senderId: string, receiverId: string) => {
    if (socket && isConnected) {
      console.log('Marking messages as read:', { senderId, receiverId });
      socket.emit('markAsRead', { senderId, receiverId });
    } else {
      console.error('Cannot mark as read - socket not connected');
    }
  };

  const startTyping = (chatId: string, userId: string) => {
    if (socket && isConnected) {
      console.log('Start typing:', { chatId, userId });
      socket.emit('typing', { chatId, userId });
    } else {
      console.error('Cannot start typing - socket not connected');
    }
  };

  const stopTyping = (chatId: string, userId: string) => {
    if (socket && isConnected) {
      console.log('Stop typing:', { chatId, userId });
      socket.emit('stopTyping', { chatId, userId });
    } else {
      console.error('Cannot stop typing - socket not connected');
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        messages,
        typingUsers,
        sendMessage,
        deleteMessage,
        addReaction,
        removeReaction,
        markAsRead,
        startTyping,
        stopTyping,
        clearMessages,
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