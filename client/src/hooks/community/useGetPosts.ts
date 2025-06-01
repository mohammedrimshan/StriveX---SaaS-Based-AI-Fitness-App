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

export const useGetPosts = ({ 
  category, 
  sortBy = 'latest', 
  skip = 0, 
  limit = 10 
}: GetPostsParams) => {
  const queryClient = useQueryClient();
  const { socket, isConnected, posts: socketPosts } = useSocket();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id;

  const query = useQuery<PaginatedPostsResponse, Error>({
    queryKey: ['posts', { category, sortBy, skip, limit }],
    queryFn: () => getPosts(category, sortBy, skip, limit),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sync socket posts to React Query cache
  useEffect(() => {
    if (socketPosts.length > 0 && query.data) {
      const newSocketPosts = socketPosts.filter(socketPost => 
        !query.data.items.some(queryPost => queryPost.id === socketPost.id)
      );

      if (newSocketPosts.length > 0) {
        const relevantPosts = category 
          ? newSocketPosts.filter(post => post.category === category)
          : newSocketPosts;

        if (relevantPosts.length > 0) {
          queryClient.setQueryData<PaginatedPostsResponse>(
            ['posts', { category, sortBy, skip, limit }],
            (old) => {
              if (!old) return old;
              return {
                ...old,
                items: [...relevantPosts, ...old.items],
                total: old.total + relevantPosts.length,
              };
            }
          );
        }
      }
    }
  }, [socketPosts, query.data, queryClient, category, sortBy, skip, limit]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, skipping listeners');
      return;
    }

    const onNewPost = (post: IPost) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['posts', { category, sortBy, skip, limit }] });
      }, 300);
    };

    const onPostDeleted = ({ postId }: { postId: string }) => {
      queryClient.setQueriesData<PaginatedPostsResponse>(
        { queryKey: ['posts'] },
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

    // ✅ Updated and Correct `postLiked` Listener
    // useGetPosts.ts
const onPostLiked = ({ postId, userId: likedUserId, likes }) => {
  console.log('[DEBUG] Received postLiked event:', { postId, likedUserId, likes, currentUserId: userId });
  queryClient.setQueriesData<PaginatedPostsResponse>(
    { queryKey: ['posts'] },
    (old) => {
      if (!old) return { items: [], total: 0 };
      const newData = {
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
      console.log('[DEBUG] Updated posts cache:', newData.items.find((p) => p.id === postId));
      return newData;
    }
  );
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

  const allPosts = query.data?.items || [];

  return {
    posts: allPosts,
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};
