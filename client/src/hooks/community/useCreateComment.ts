import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createComment } from '@/services/client/clientService';
import { IComment } from '@/types/Post';
import { useSocket } from '@/context/socketContext';

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const mutation = useMutation<IComment, Error, { postId: string; textContent: string; role: string }>({
    mutationFn: ({ postId, textContent, role }) => {
      console.log('[DEBUG] Creating comment:', { postId, textContent, role });
      return createComment(postId, textContent, role);
    },
    onSuccess: (newComment, { postId }) => {
      console.log('[DEBUG] Comment created:', newComment);
      queryClient.setQueryData(['comments', postId], (old: any) => {
        if (!old) {
          return {
            success: true,
            data: {
              comments: [newComment],
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
            comments: [newComment, ...old.data.comments],
            total: old.data.total + 1,
            totalPages: Math.ceil((old.data.total + 1) / old.data.limit),
          },
        };
      });
      queryClient.setQueryData(['post', postId], (old: any) => {
        if (!old) {
          console.warn('[DEBUG] No post data to update comment count');
          return undefined;
        }
        return {
          ...old,
          commentCount: (old?.commentCount || 0) + 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error) => {
      console.error('[DEBUG] Create comment error:', error.message);
    },
  });

  useEffect(() => {
    if (socket) {
      socket.on('newComment', (comment: IComment) => {
        console.log('[DEBUG] New comment received:', comment);
        queryClient.setQueryData(['comments', comment.postId], (old: any) => {
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
        queryClient.setQueryData(['post', comment.postId], (old: any) => {
          if (!old) {
            console.warn('[DEBUG] No post data to update comment count');
            return undefined;
          }
          return {
            ...old,
            commentCount: (old?.commentCount || 0) + 1,
          };
        });
      });

      return () => {
        socket.off('newComment');
      };
    }
  }, [socket, queryClient]);

  return {
    createComment: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
    comment: mutation.data,
  };
};