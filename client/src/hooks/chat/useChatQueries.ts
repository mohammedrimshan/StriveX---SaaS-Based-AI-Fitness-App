import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChatHistory,
  getRecentChats,
  getChatParticipants,
  deleteMessage,
} from '@/services/chat/chatService';
import {
  ChatHistoryResponse,
  RecentChatsResponse,
  ChatParticipantsResponse,
  RawParticipant,
  IChatParticipant,
} from '@/types/Chat';
import { UserRole } from '@/types/UserRole';
import toast from 'react-hot-toast';

export const useChatHistory = (
  role: UserRole,
  participantId: string,
  page: number = 1,
  limit: number = 20
) => {
  return useQuery<ChatHistoryResponse, Error>({
    queryKey: ['chatHistory', role, participantId, page, limit],
    queryFn: async () => {
      try {
        return await getChatHistory(role, participantId, page, limit);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to fetch chat history');
        throw err;
      }
    },
    enabled: !!participantId && !!role && ['client', 'trainer'].includes(role),
  });
};

export const useRecentChats = (
  role: UserRole,
  page: number = 1,
  limit: number = 10
) => {
  return useQuery<RecentChatsResponse, Error>({
    queryKey: ['recentChats', role, page, limit],
    queryFn: async () => {
      try {
        return await getRecentChats(role, page, limit);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to fetch recent chats');
        throw err;
      }
    },
    enabled: !!role && ['client', 'trainer'].includes(role),
  });
};

export const useChatParticipants = (role: UserRole) => {
  return useQuery<ChatParticipantsResponse, Error>({
    queryKey: ['chatParticipants', role],
    queryFn: async () => {
      try {
        const data = await getChatParticipants(role);

        const normalizedParticipants: IChatParticipant[] = data.participants.map((p: RawParticipant) => {
          const firstName = p.firstName || p.name?.split(' ')[0] || 'Unknown';
          const lastName = p.lastName || p.name?.split(' ').slice(1).join(' ') || '';
          return {
            id: p.userId || p.id || '',
            userId: p.userId || p.id || '',
            role: p.role || role,
            firstName,
            lastName,
            email: p.email || '',
            isOnline: p.isOnline ?? p.status === 'online',
            avatar:
              p.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}+${encodeURIComponent(
                lastName
              )}&background=8B5CF6&color=fff`,
            lastSeen: p.lastSeen,
          };
        });

        return {
          ...data,
          participants: normalizedParticipants,
        };
      } catch (err: any) {
        toast.error(err?.message || 'Failed to fetch chat participants');
        throw err;
      }
    },
    enabled: !!role && ['client', 'trainer'].includes(role),
  });
};

export const useDeleteMessage = (role: UserRole) => {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string },
    Error,
    { messageId: string; participantId: string },
    { previousHistory?: ChatHistoryResponse }
  >({
    mutationFn: ({ messageId }) => deleteMessage(role, messageId),

    onMutate: async ({ messageId, participantId }) => {
      await queryClient.cancelQueries({ queryKey: ['chatHistory', role, participantId] });

      const previousHistory = queryClient.getQueryData<ChatHistoryResponse>([
        'chatHistory',
        role,
        participantId,
      ]);

      if (previousHistory) {
        queryClient.setQueryData<ChatHistoryResponse>(['chatHistory', role, participantId], {
          ...previousHistory,
          messages: previousHistory.messages.map((msg) =>
            msg.id === messageId ? { ...msg, deleted: true } : msg
          ),
        });
      }

      return { previousHistory };
    },

    onError: (error, { participantId }, context) => {
      const safeContext = context as { previousHistory?: ChatHistoryResponse };
      if (safeContext?.previousHistory) {
        queryClient.setQueryData(['chatHistory', role, participantId], safeContext.previousHistory);
      }
      toast.error(error.message || 'Failed to delete message');
    },

    onSuccess: (_, { participantId }) => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', role, participantId] });
      toast.success('Message deleted successfully');
    },
  });
};
