import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportComment } from '@/services/client/clientService';
import { IComment } from '@/types/Post';

export const useReportComment = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<IComment, Error, { id: string; reason: string; role: string }>({
    mutationFn: ({ id, reason, role }) => reportComment(id, reason, role),
    onSuccess: (updatedComment, { id }) => {
      queryClient.setQueryData(['comments'], (old: any) => ({
        ...old,
        items: old?.items?.map((comment: IComment) =>
          comment.id === id ? updatedComment : comment
        ) || [],
      }));
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: (error) => {
      console.error('Report comment error:', error.message);
    },
  });

  return {
    reportComment: mutation.mutate,
    isReporting: mutation.isPending,
    error: mutation.error,
    comment: mutation.data,
  };
};