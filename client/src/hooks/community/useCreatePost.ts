import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createPost } from '@/services/client/clientService';
import { useSocket } from '@/context/socketContext';
import { UserRole } from '@/types/UserRole';
import { IPost } from '@/types/Post';

interface CreatePostData {
  textContent: string;
  mediaUrl?: string; // Cloudinary URL
  role: UserRole; 
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const mutation = useMutation<IPost, Error, CreatePostData>({
    mutationFn: (data) => createPost(data),
    onSuccess: (newPost) => {
      // Update all possible posts query keys
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Also update the cache directly for immediate feedback
      queryClient.setQueryData(['posts'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: [newPost, ...(old.items || [])],
          total: (old.total || 0) + 1,
        };
      });
    },
    onError: (error) => {
      console.error('Create post error:', error.message);
    },
  });

  // Socket event handler is still valuable as it handles posts from other users
  useEffect(() => {
    if (socket) {
      const handleNewPost = (post: IPost) => {
        console.log('Socket received new post:', post);
        
        // Invalidate all posts queries to ensure we get fresh data
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      };

      socket.on('newPost', handleNewPost);

      return () => {
        socket.off('newPost', handleNewPost);
      };
    }
  }, [socket, queryClient]);

  return {
    createPost: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
    post: mutation.data,
  };
};