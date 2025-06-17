import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getComments, PaginatedCommentsResponse} from '@/services/client/clientService';
import { IComment } from '@/types/Post';
import { useSocket } from '@/context/socketContext';
import { FrontendComment } from '@/services/socketService';

interface UseGetCommentsResult {
  comments: IComment[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useGetComments = (postId: string, page: number = 1, limit: number = 10): UseGetCommentsResult => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery<PaginatedCommentsResponse, Error>({
    queryKey: ['comments', postId, page, limit],
    queryFn: () => getComments(postId, page, limit),
    // enabled: !!postId && mongoose.Types.ObjectId.isValid(postId),
    enabled: !!postId && /^[a-f\d]{24}$/i.test(postId),
  });

  useEffect(() => {
    if (socket && postId) {
      // Join post-specific room
      socket.emit('joinPost', postId);
      console.log(`Joined post room: post:${postId}`);

      // Handle new comment
      socket.on('newComment', (comment: FrontendComment) => {
        if (comment.postId === postId) {
          queryClient.setQueryData(['comments', postId, page, limit], (old: PaginatedCommentsResponse | undefined) => {
            if (!old) return { data: { comments: [comment], total: 1, page, limit, totalPages: 1 } };
            // Only add if comment is not already in the list
            const commentExists = old.data.comments.some((c) => c.id === comment.id);
            if (commentExists) return old;
            // Add to the top if on the first page
            const updatedComments = page === 1 ? [comment, ...old.data.comments] : old.data.comments;
            return {
              ...old,
              data: {
                ...old.data,
                comments: updatedComments,
                total: old.data.total + 1,
                totalPages: Math.ceil((old.data.total + 1) / limit),
              },
            };
          });
          // Update post's commentsCount
          queryClient.setQueryData(['post', postId], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              commentsCount: (old.commentsCount || 0) + 1,
            };
          });
        }
      });

      // Handle comment liked
      socket.on('commentLiked', ({ commentId, likes }: { commentId: string; userId: string; likes: string[] }) => {
        queryClient.setQueryData(['comments', postId, page, limit], (old: PaginatedCommentsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              comments: old.data.comments.map((comment) =>
                comment.id === commentId ? { ...comment, likes } : comment
              ),
            },
          };
        });
      });

      // Handle comment deleted
      socket.on('commentDeleted', ({ commentId }: { commentId: string }) => {
        queryClient.setQueryData(['comments', postId, page, limit], (old: PaginatedCommentsResponse | undefined) => {
          if (!old) return old;
          const updatedComments = old.data.comments.filter((comment) => comment.id !== commentId);
          return {
            ...old,
            data: {
              ...old.data,
              comments: updatedComments,
              total: old.data.total - 1,
              totalPages: Math.ceil((old.data.total - 1) / limit),
            },
          };
        });
        // Update post's commentsCount
        queryClient.setQueryData(['post', postId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            commentsCount: Math.max(0, (old.commentsCount || 0) - 1),
          };
        });
      });

      return () => {
        socket.emit('leavePost', postId);
        socket.off('newComment');
        socket.off('commentLiked');
        socket.off('commentDeleted');
        console.log(`Left post room: post:${postId}`);
      };
    }
  }, [socket, queryClient, postId, page, limit]);

  return {
    comments: query.data?.data.comments || [],
    total: query.data?.data.total || 0,
    page: query.data?.data.page || page,
    totalPages: query.data?.data.totalPages || 1,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};