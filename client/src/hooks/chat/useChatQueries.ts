import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatHistory, getRecentChats, getChatParticipants, deleteMessage } from '@/services/chat/chatService';
import { ChatHistoryResponse, RecentChatsResponse, ChatParticipantsResponse } from '@/types/Chat';
import { UserRole } from '@/types/UserRole';
import toast from 'react-hot-toast';

export const useChatHistory = (role: UserRole, participantId: string, page: number = 1, limit: number = 20) => {
  return useQuery<ChatHistoryResponse, Error>({
    queryKey: ['chatHistory', role, participantId, page, limit],
    queryFn: () => getChatHistory(role, participantId, page, limit),
    enabled: !!participantId && !!role && ['client', 'trainer'].includes(role),
    onError: (error) => {
      toast.error(error.message || 'Failed to fetch chat history');
    },
  });
};

export const useRecentChats = (role: UserRole, page: number = 1, limit: number = 10) => {
  return useQuery<RecentChatsResponse, Error>({
    queryKey: ['recentChats', role, page, limit],
    queryFn: () => getRecentChats(role, page, limit),
    enabled: !!role && ['client', 'trainer'].includes(role),
    onError: (error) => {
      toast.error(error.message || 'Failed to fetch recent chats');
    },
  });
};

export const useChatParticipants = (role: UserRole) => {
  return useQuery<ChatParticipantsResponse, Error>({
    queryKey: ['chatParticipants', role],
    queryFn: async () => {
      const data = await getChatParticipants(role);
      console.log("Raw Chat Participants Response:", data);
      // Normalize participants
      const normalizedParticipants = data.participants.map((p: any) => {
        const firstName = p.firstName || p.name?.split(" ")[0] || "Unknown";
        const lastName = p.lastName || p.name?.split(" ").slice(1).join(" ") || "";
        return {
          ...p,
          userId: p.userId || p.id || "",
          id: p.id || p.userId || "",
          firstName,
          lastName,
          email: p.email || "",
          isOnline: p.isOnline ?? p.status === "online",
          avatar: p.avatar || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=8B5CF6&color=fff`,
          role: p.role || role,
        };
      });
      console.log("Normalized Participants:", normalizedParticipants);
      return {
        ...data,
        participants: normalizedParticipants,
      };
    },
    enabled: !!role && ['client', 'trainer'].includes(role),
    onError: (error) => {
      toast.error(error.message || 'Failed to fetch chat participants');
    },
  });
};

export const useDeleteMessage = (role: UserRole) => {
  const queryClient = useQueryClient();
  return useMutation<
    { success: boolean; message: string },
    Error,
    { messageId: string; participantId: string }
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
        queryClient.setQueryData<ChatHistoryResponse>(
          ['chatHistory', role, participantId],
          {
            ...previousHistory,
            messages: previousHistory.messages.map((msg) =>
              msg.id === messageId ? { ...msg, deleted: true } : msg
            ),
          }
        );
      }

      return { previousHistory };
    },
    onError: (error, { participantId }, context: { previousHistory?: ChatHistoryResponse }) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(['chatHistory', role, participantId], context.previousHistory);
      }
      toast.error(error.message || 'Failed to delete message');
    },
    onSuccess: (_, { participantId }) => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', role, participantId] });
      toast.success('Message deleted successfully');
    },
  });
};