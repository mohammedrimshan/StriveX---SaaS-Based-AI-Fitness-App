import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost } from '@/services/client/clientService';

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  

  const mutation = useMutation<void, Error, { id: string; role: string }>({
    mutationFn: ({ id, role }) => deletePost(id, role),
    onSuccess: (_, { id }) => {
      queryClient.setQueryData(['posts'], (old: any) => ({
        ...old,
        items: old?.items?.filter((post: any) => post.id !== id) || [],
        total: (old?.total || 0) - 1,
      }));
      queryClient.invalidateQueries({ queryKey: ['posts'] });

    },
    onError: (error) => {
      console.error('Delete post error:', error.message);
    },
  });

  return {
    deletePost: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
};