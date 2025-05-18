import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportPost } from '@/services/client/clientService';
import { IPost } from '@/types/Post';

export const useReportPost = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<IPost, Error, { id: string; reason: string; role: string }>({
    mutationFn: ({ id, reason, role }) => reportPost(id, reason, role),
    onSuccess: (updatedPost, { id }) => {
      queryClient.setQueryData(['posts'], (old: any) => ({
        ...old,
        items: old?.items?.map((post: IPost) =>
          post.id === id ? updatedPost : post
        ) || [],
      }));
      queryClient.setQueryData(['post', id], updatedPost);
     queryClient.invalidateQueries({ queryKey: ['posts'] });

    },
    onError: (error) => {
      console.error('Report post error:', error.message);
    },
  });

  return {
    reportPost: mutation.mutate,
    isReporting: mutation.isPending,
    error: mutation.error,
    post: mutation.data,
  };
};