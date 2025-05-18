import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeComment } from '@/services/client/clientService';
import { IComment } from '@/services/client/clientService';

export const useLikeComment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<IComment, Error, { id: string; role: string }>({
    mutationFn: ({ id, role }) => likeComment(id, role),
    onSuccess: (updatedComment, { id }) => {
      queryClient.setQueryData(['comments'], (old: any) => ({
        ...old,
        items: old?.items?.map((comment: IComment) =>
          comment.id === id ? updatedComment : comment
        ) || [],
      }));
      queryClient.invalidateQueries(['comments']);
    },
    onError: (error) => {
      console.error('Like comment error:', error.message);
    },
  });

  return {
    likeComment: mutation.mutate,
    isLiking: mutation.isPending,
    error: mutation.error,
    comment: mutation.data,
  };
};