import { axiosInstance } from '@/api/private.axios';
import {
  ChatHistoryResponse,
  RecentChatsResponse,
  ChatParticipantsResponse,
} from '@/types/Chat';
import { UserRole } from '@/types/UserRole';

// Helper function to get URL prefix based on role
const getPrefix = (role: UserRole) => {
  return role === 'trainer' ? '/trainer' : '/client';
};

// Get chat history
export const getChatHistory = async (
  role: UserRole,
  participantId: string,
  page: number = 1,
  limit: number = 20
): Promise<ChatHistoryResponse> => {
  try {
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

// Get recent chats
export const getRecentChats = async (
  role: UserRole,
  page: number = 1,
  limit: number = 10
): Promise<RecentChatsResponse> => {
  try {
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

// Get chat participants
export const getChatParticipants = async (
  role: UserRole
): Promise<ChatParticipantsResponse> => {
  try {
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

// Delete message
export const deleteMessage = async (
  role: UserRole,
  messageId: string
): Promise<{ success: boolean; message: string }> => {
  try {
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