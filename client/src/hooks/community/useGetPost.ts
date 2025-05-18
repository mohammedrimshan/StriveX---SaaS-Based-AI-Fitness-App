import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getPost } from '@/services/client/clientService';
import { IPost, IComment } from '@/services/client/clientService';
import { useSocket } from '@/context/socketContext';

// Validate MongoDB ObjectID (24-character hex string)
const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

export const useGetPost = (postId: string) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery<IPost, Error>({
    queryKey: ['post', postId],
    queryFn: () => {
      console.log('[DEBUG] Fetching post with ID:', postId);
      return getPost(postId);
    },
    enabled: !!postId && isValidObjectId(postId),
    retry: 1,
    onError: (error: Error) => {
      console.error('[DEBUG] useGetPost error:', error.message, error);
    },
  });

  useEffect(() => {
    if (socket && postId && isValidObjectId(postId)) {
      socket.emit('joinPost', postId);
      console.log(`[DEBUG] Joined post room: post:${postId}`);

      socket.on('postDeleted', ({ postId: deletedId }: { postId: string }) => {
        console.log('[DEBUG] Post deleted:', deletedId);
        if (deletedId === postId) {
          queryClient.setQueryData(['post', postId], (old: IPost | undefined) => {
            if (!old) {
              console.warn('[DEBUG] No post data to mark as deleted');
              return undefined;
            }
            return { ...old, isDeleted: true };
          });
        }
      });

      socket.on('postLiked', ({ postId: likedId, userId, likes }: { postId: string; userId: string; likes: string[] }) => {
        console.log('[DEBUG] Post liked:', { likedId, userId, likes });
        if (likedId === postId) {
          queryClient.setQueryData(['post', postId], (old: IPost | undefined) => {
            if (!old) {
              console.warn('[DEBUG] No post data to update likes');
              return undefined;
            }
            return {
              ...old,
              likes,
              hasLiked: likes.includes(userId),
            };
          });
        }
      });

      socket.on('receiveCommunityMessage', (comment: IComment) => {
        console.log('[DEBUG] Received community message:', comment);
        if (comment.postId === postId) {
          queryClient.setQueryData(['post', postId], (old: IPost | undefined) => {
            if (!old) {
              console.warn('[DEBUG] No post data to update comment count');
              return undefined;
            }
            return {
              ...old,
              commentCount: (old.commentCount || 0) + 1,
            };
          });
          queryClient.setQueryData(['comments', postId], (old: any) => {
            if (!old) {
              return {
                success: true,
                data: {
                  comments: [comment],
                  total: 1,
                  page: 1,
                  limit: 10,
                  totalPages: 1,
                },
              };
            }
            return {
              ...old,
              data: {
                ...old.data,
                comments: [comment, ...old.data.comments],
                total: old.data.total + 1,
                totalPages: Math.ceil((old.data.total + 1) / old.data.limit),
              },
            };
          });
        }
      });

      return () => {
        socket.emit('leavePost', postId);
        socket.off('postDeleted');
        socket.off('postLiked');
        socket.off('receiveCommunityMessage');
        console.log(`[DEBUG] Left post room: post:${postId}`);
      };
    }
  }, [socket, queryClient, postId]);

  return {
    post: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};