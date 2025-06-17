import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComment } from '@/services/client/clientService';

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, { id: string; role: string }>({
    mutationFn: ({ id, role }) => deleteComment(id, role),
    onSuccess: (_, { id }) => {
      queryClient.setQueryData(['comments'], (old: any) => ({
        ...old,
        items: old?.items?.filter((comment: any) => comment.id !== id) || [],
        total: (old?.total || 0) - 1,
      }));
      queryClient.invalidateQueries({ queryKey: ["comments"] })
    },
    onError: (error) => {
      console.error('Delete comment error:', error.message);
    },
  });

  return {
    deleteComment: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
};