import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPost,
  getPosts,
  getPost,
  deletePost,
  likePost,
  reportPost,
  createComment,
  likeComment,
  deleteComment,
  reportComment,
  IComment,
  PaginatedPostsResponse,
} from '@/services/client/clientService';
import { useSocket } from '@/context/socketContext';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState, store } from '@/store/store';

// Selector to get userId based on role
const selectUserId = (state: RootState): string => {
  const client = state.client.client;
  const trainer = state.trainer.trainer;
  const admin = state.admin.admin;

  if (client && client.role === 'client') {
    return client.id;
  } else if (trainer && trainer.role === 'trainer') {
    return trainer.id;
  } else if (admin && admin.role === 'admin') {
    return admin.id;
  }
  throw new Error('User not authenticated');
};

// Selector to get user role
const selectUserRole = (state: RootState): string => {
  const client = state.client.client;
  const trainer = state.trainer.trainer;
  const admin = state.admin.admin;

  if (client && client.role === 'client') {
    return 'client';
  } else if (trainer && trainer.role === 'trainer') {
    return 'trainer';
  } else if (admin && admin.role === 'admin') {
    return 'admin';
  }
  throw new Error('User role not found');
};

interface UsePostsOptions {
  category?: string;
  sortBy?: 'latest' | 'likes' | 'comments';
  skip?: number;
  limit?: number;
  enabled?: boolean;
}

export const usePosts = ({
  category,
  sortBy,
  skip = 0,
  limit = 10,
  enabled = true,
}: UsePostsOptions) => {
  const queryClient = useQueryClient();
  const { posts, isConnected } = useSocket();

  console.log('Socket posts:', posts, 'isConnected:', isConnected, 'Category:', posts);

  useEffect(() => {
    if (posts && posts.length > 0 && isConnected) {
      console.log('Updating cache with socket posts:', posts);
      queryClient.setQueryData(['posts', { category, sortBy, skip, limit }], (_: PaginatedPostsResponse | undefined) => {
        const filteredPosts = posts.filter(post => {
          const matchesCategory = !category || post.category === category;
          console.log('Post:', post.id, 'Category:', post.category, 'Matches:', matchesCategory);
          return !post.deleted && matchesCategory;
        });
        console.log('Filtered socket posts:', filteredPosts);
        return {
          success: true,
          posts: filteredPosts,
          totalPosts: filteredPosts.length,
          currentSkip: skip,
          limit,
        };
      });
    }
  }, [posts, category, sortBy, skip, limit, queryClient, isConnected]);

  return useQuery({
    queryKey: ['posts', { category, sortBy, skip, limit }],
    queryFn: async () => {
      const response = await getPosts(category, sortBy, skip, limit);
      console.log('API posts:', response);
      return response || {
        success: true,
        posts: [],
        totalPosts: 0,
        currentSkip: skip,
        limit,
      };
    },
    enabled: enabled && !isConnected,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  return useMutation({
    mutationFn: (data: { textContent: string; media?: string; category: string }) => {
      const userId = selectUserId(store.getState());
      const role = selectUserRole(store.getState());

      if (socket) {
        return new Promise((resolve, reject) => {
          socket.emit('createPost', {
            senderId: userId,
            textContent: data.textContent,
            media: data.media ? { type: 'image', base64: data.media } : undefined,
            category: data.category,
            role,
          }, (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          });
        });
      }

      return createPost({
        textContent: data.textContent,
        media: data.media,
        role,
      });
    },
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.setQueryData(['posts'], (old: PaginatedPostsResponse | undefined) => {
        if (!old) return { success: true, posts: [newPost], totalPosts: 1, currentSkip: 0, limit: 10 };
        return {
          ...old,
          posts: [newPost, ...old.posts],
          totalPosts: old.totalPosts + 1,
        };
      });
    },
    onError: (error: Error) => {
      console.error('Create post error:', error.message);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: (postId: string) => {
      if (socket) {
        return new Promise((resolve, reject) => {
          socket.emit('deletePost', { postId, role }, (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          });
        });
      }
      return deletePost(postId, role);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: (error: Error) => {
      console.error('Delete post error:', error.message);
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const userId = useSelector(selectUserId);
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: (postId: string) => {
      if (socket) {
        return new Promise((resolve, reject) => {
          socket.emit('likePost', { postId, userId, role }, (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          });
        });
      }
      return likePost(postId, role);
    },
    onSuccess: (updatedPost, postId) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.setQueryData(['post', postId], updatedPost);
    },
    onError: (error: Error) => {
      console.error('Like post error:', error.message);
    },
  });
};

export const useReportPost = () => {
  const queryClient = useQueryClient();
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason: string }) =>
      reportPost(postId, reason, role),
    onSuccess: (updatedPost, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.setQueryData(['post', postId], updatedPost);
    },
    onError: (error: Error) => {
      console.error('Report post error:', error.message);
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { sendCommunityMessage, isConnected } = useSocket();
  const userId = useSelector(selectUserId);
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: ({ postId, textContent, media }: { postId: string; textContent: string; media?: { type: 'image' | 'video'; base64: string; name?: string } }) => {
      if (isConnected && (media || textContent)) {
        return new Promise<IComment>((resolve) => {
          sendCommunityMessage({
            postId,
            senderId: userId,
            text: textContent,
            media,
            role,
          });

          resolve({
            id: `temp-${Date.now()}`,
            postId,
            authorId: userId,
            textContent,
            likes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDeleted: false,
            reports: [],
          });
        });
      }
      return createComment(postId, textContent, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      console.error('Create comment error:', error.message);
    },
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: (commentId: string) => likeComment(commentId, role),
    onSuccess: (_: IComment) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      console.error('Like comment error:', error.message);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      console.error('Delete comment error:', error.message);
    },
  });
};

export const useReportComment = () => {
  const queryClient = useQueryClient();
  const role = useSelector(selectUserRole);

  return useMutation({
    mutationFn: ({ commentId, reason }: { commentId: string; reason: string }) =>
      reportComment(commentId, reason, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      console.error('Report comment error:', error.message);
    },
  });
};