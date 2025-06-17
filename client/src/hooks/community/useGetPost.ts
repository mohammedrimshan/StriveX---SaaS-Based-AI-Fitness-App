import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getPost } from '@/services/client/clientService';
import { IPost, IComment } from '@/types/Post';
import { useSocket } from '@/context/socketContext';
import { selectCurrentUser } from '@/store/userSelectors';
import { useSelector } from 'react-redux';

const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

export const useGetPost = (postId: string) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id ?? '';

  const query = useQuery<IPost, Error>({
    queryKey: ['post', postId],
    queryFn: () => {
      console.log('[DEBUG] Fetching post with ID:', postId);
      if (!isValidObjectId(postId)) {
        throw new Error('Invalid post ID');
      }
      return getPost(postId);
    },
    enabled: !!postId && isValidObjectId(postId),
    retry: 1,
    //@ts-ignore
    onError: (error: Error) => {
      console.error('[DEBUG] useGetPost error:', error.message);
    },
  });

  useEffect(() => {
    if (!socket || !postId || !isValidObjectId(postId)) return;

    socket.emit('joinPost', postId, () => {
      console.log(`[DEBUG] Joined post room: post:${postId}`);
    });

    const handlePostDeleted = ({ postId: deletedId }: { postId: string }) => {
      if (deletedId === postId) {
        console.log('[DEBUG] Post deleted:', deletedId);
        queryClient.setQueryData(['post', postId], (old: IPost | undefined) => {
          if (!old) return undefined;
          return { ...old, isDeleted: true };
        });
      }
    };

    const handlePostLiked = ({ postId: likedId, userId: likerId, likes }: { postId: string; userId: string; likes: string[] }) => {
      if (likedId === postId) {
        console.log('[DEBUG] Post liked:', { likedId, likerId, likes });
        queryClient.setQueryData(['post', postId], (old: IPost | undefined) => {
          if (!old) return undefined;
          return {
            ...old,
            likes,
            hasLiked: userId ? likes.includes(userId) : false,
          };
        });
        queryClient.setQueryData(['posts'], (old: { items: IPost[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((post) =>
              post.id === likedId
                ? {
                    ...post,
                    likes,
                    hasLiked: userId ? likes.includes(userId) : false,
                  }
                : post
            ),
          };
        });
      }
    };

    const handleReceiveCommunityMessage = (comment: IComment) => {
      if (comment.postId === postId) {
        console.log('[DEBUG] Received community message:', comment);
        queryClient.setQueryData(['post', postId], (old: IPost | undefined) => {
          if (!old) return undefined;
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
    };

    socket.on('postDeleted', handlePostDeleted);
    socket.on('postLiked', handlePostLiked);
    socket.on('receiveCommunityMessage', handleReceiveCommunityMessage);

    return () => {
      socket.emit('leavePost', postId);
      socket.off('postDeleted', handlePostDeleted);
      socket.off('postLiked', handlePostLiked);
      socket.off('receiveCommunityMessage', handleReceiveCommunityMessage);
      console.log(`[DEBUG] Left post room: post:${postId}`);
    };
  }, [socket, queryClient, postId, userId]);

  return {
    post: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};