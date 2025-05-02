import { clientAxiosInstance } from '@/api/client.axios';
import { trainerAxiosInstance } from '@/api/trainer.axios';
import {
  ChatHistoryResponse,
  RecentChatsResponse,
  ChatParticipantsResponse,
} from '@/types/Chat';
import { UserRole } from '@/types/UserRole';

const getAxiosInstance = (role: UserRole) => {
  return role === 'trainer' ? trainerAxiosInstance : clientAxiosInstance;
};

const getPrefix = (role: UserRole) => {
  return role === 'trainer' ? '/trainer' : '/client';
};

export const getChatHistory = async (
  role: UserRole,
  participantId: string,
  page: number = 1,
  limit: number = 20
): Promise<ChatHistoryResponse> => {
  try {
    const axiosInstance = getAxiosInstance(role);
    const prefix = getPrefix(role);
    const response = await axiosInstance.get<ChatHistoryResponse>(
      `${prefix}/chats/history/${participantId}`,
      { params: { page, limit } }
    );
    console.log('Chat history:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get chat history error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to fetch chat history');
  }
};

export const getRecentChats = async (
  role: UserRole,
  page: number = 1,
  limit: number = 10
): Promise<RecentChatsResponse> => {
  try {
    const axiosInstance = getAxiosInstance(role);
    const prefix = getPrefix(role);
    const response = await axiosInstance.get<RecentChatsResponse>(
      `${prefix}/chats/recent`,
      { params: { page, limit } }
    );
    console.log('Recent chats:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get recent chats error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to fetch recent chats');
  }
};

export const getChatParticipants = async (
  role: UserRole
): Promise<ChatParticipantsResponse> => {
  try {
    const axiosInstance = getAxiosInstance(role);
    const prefix = getPrefix(role);
    const response = await axiosInstance.get<ChatParticipantsResponse>(
      `${prefix}/chats/participants`
    );
    console.log('Chat participants:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get chat participants error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to fetch chat participants');
  }
};

export const deleteMessage = async (
  role: UserRole,
  messageId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const axiosInstance = getAxiosInstance(role);
    const prefix = getPrefix(role);
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(
      `${prefix}/chats/messages/${messageId}`
    );
    console.log('Message deleted:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Delete message error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to delete message');
  }
};
