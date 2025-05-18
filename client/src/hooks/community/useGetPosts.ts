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

  console.log('🔥 useGetPosts HOOK called with:', { category, sortBy, skip, limit, isConnected });
  console.log('🔌 Socket posts available:', socketPosts.length);

  const query = useQuery<PaginatedPostsResponse, Error>({
    queryKey: ['posts', { category, sortBy, skip, limit }],
    queryFn: () => {
      console.log('🚀 Calling getPosts SERVICE from useQuery...');
      return getPosts(category, sortBy, skip, limit);
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Effect to sync socket posts with query data
  useEffect(() => {
    if (socketPosts.length > 0 && query.data) {
      // Find socket posts that aren't in the current query data
      const newSocketPosts = socketPosts.filter(socketPost => 
        !query.data.items.some(queryPost => queryPost.id === socketPost.id)
      );

      // If we have relevant socket posts that aren't in the query data
      if (newSocketPosts.length > 0) {
        console.log('🔄 Syncing socket posts with query data:', newSocketPosts.length);
        
        // Only include posts matching the current category filter
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
                total: old.total + relevantPosts.length
              };
            }
          );
        }
      }
    }
  }, [socketPosts, query.data, queryClient, category, sortBy, skip, limit]);

  useEffect(() => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, skipping listeners');
      return;
    }

    console.log('🔌 WebSocket listener set up for posts...');

    const onNewPost = (post: IPost) => {
      console.log('📬 New post received via socket:', post);
      // We don't need to manually update here since the socketPosts array 
      // in the context will be updated automatically
      
      // Force refetch to ensure we have the latest data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['posts', { category, sortBy, skip, limit }] });
      }, 300);
    };

    const onPostDeleted = ({ postId }: { postId: string }) => {
      console.log('❌ Post deleted via socket:', postId);
      queryClient.setQueriesData<PaginatedPostsResponse>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;
          const newData = {
            ...old,
            items: old.items.filter((post) => post.id !== postId),
            total: Math.max(old.total - 1, 0),
          };
          console.log('Updating cache - Old:', old.items.length, 'New:', newData.items.length);
          return newData;
        }
      );
    };

const onPostLiked = ({ postId, userId: likedUserId, likes }) => {
  console.log('❤️ Post liked via socket:', { postId, likes, likedUserId, currentUserId: userId });
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
      console.log('Updating cache - Likes updated for post:', postId);
      return newData;
    }
  );

  // Update individual post query
  queryClient.setQueryData(['post', postId], (oldPost: IPost | undefined) => {
    if (!oldPost) return oldPost;
    return {
      ...oldPost,
      likes: likes || [],
      hasLiked: userId ? likes.includes(userId) : false,
    };
  });
};

    socket.on('newPost', onNewPost);
    socket.on('postDeleted', onPostDeleted);
    socket.on('postLiked', onPostLiked);

    return () => {
      console.log('🧹 Cleaning up socket listeners for:', { category, sortBy, skip, limit });
      socket.off('newPost', onNewPost);
      socket.off('postDeleted', onPostDeleted);
      socket.off('postLiked', onPostLiked);
    };
  }, [socket, isConnected, queryClient, category, sortBy, skip, limit, userId]);

  // Merge socket posts with query data for return
  const allPosts = query.data?.items || [];
  
  console.log('Query state:', {
    posts: allPosts.length,
    total: query.data?.total,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  });

  return {
    posts: allPosts,
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
};