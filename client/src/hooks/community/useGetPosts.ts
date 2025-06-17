import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getPosts } from '@/services/client/clientService';
import { useSocket } from '@/context/socketContext';
import { PaginatedPostsResponse, IPost } from '@/types/Post';
import { selectCurrentUser } from '@/store/userSelectors';

interface GetPostsParams {
  category?: string;
  sortBy?: 'latest' | 'likes' | 'comments';
  skip?: number;
  limit?: number;
}

interface PostLikedPayload {
  postId: string;
  userId: string;
  likes: string[];
}

export const useGetPosts = ({
  category,
  sortBy = 'latest',
  skip = 0,
  limit = 10,
}: GetPostsParams) => {
  const queryClient = useQueryClient();
  const { socket, isConnected, posts: socketPosts } = useSocket();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id ?? '';

  const query = useQuery<PaginatedPostsResponse, Error>({
    queryKey: ['posts', { category, sortBy, skip, limit }],
    queryFn: () => getPosts(category, sortBy, skip, limit),
    staleTime: 5 * 60 * 1000,
  });

  // Sync socket posts to React Query cache
  useEffect(() => {
    if (socketPosts.length > 0 && query.data) {
      const newSocketPosts = socketPosts.filter(
        (socketPost) =>
          !query.data!.items.some((queryPost) => queryPost.id === socketPost.id)
      );

      if (newSocketPosts.length > 0) {
        const relevantPosts = category
          ? newSocketPosts.filter((post) => post.category === category)
          : newSocketPosts;

        if (relevantPosts.length > 0) {
          queryClient.setQueryData<PaginatedPostsResponse>(
            ['posts', { category, sortBy, skip, limit }],
            (old) => {
              if (!old) return old;
              return {
                ...old,
                items: [...relevantPosts, ...old.items].map((post) => ({
                  ...post,
                  hasLiked: userId ? post.likes.includes(userId) : false,
                })),
                total: old.total + relevantPosts.length,
              };
            }
          );
        }
      }
    }
  }, [socketPosts, query.data, queryClient, category, sortBy, skip, limit, userId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    const onNewPost = () => {
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['posts', { category, sortBy, skip, limit }],
        });
      }, 300);
    };

    const onPostDeleted = ({ postId }: { postId: string }) => {
      queryClient.setQueryData<PaginatedPostsResponse>(
        ['posts', { category, sortBy, skip, limit }],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((post) => post.id !== postId),
            total: Math.max(old.total - 1, 0),
          };
        }
      );
    };

    const onPostLiked = ({ postId, userId, likes }: PostLikedPayload) => {
      queryClient.setQueryData<PaginatedPostsResponse>(
        ['posts', { category, sortBy, skip, limit }],
        (old) => {
          if (!old) return { items: [], total: 0, currentSkip: 0, limit: 0 };
          return {
            ...old,
            items: old.items.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    likes: likes || [],
                    hasLiked: userId ? likes.includes(userId) : false,
                  }
                : post
            ),
          };
        }
      );
      // Also update single post cache
      queryClient.setQueryData(['post', postId], (old: IPost | undefined) => {
        if (!old) return old;
        return {
          ...old,
          likes: likes || [],
          hasLiked: userId ? likes.includes(userId) : false,
        };
      });
    };

    socket.on('newPost', onNewPost);
    socket.on('postDeleted', onPostDeleted);
    socket.on('postLiked', onPostLiked);

    return () => {
      socket.off('newPost', onNewPost);
      socket.off('postDeleted', onPostDeleted);
      socket.off('postLiked', onPostLiked);
    };
  }, [socket, isConnected, queryClient, category, sortBy, skip, limit, userId]);

  const posts: IPost[] = query.data?.items ?? [];

  return {
    posts,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};