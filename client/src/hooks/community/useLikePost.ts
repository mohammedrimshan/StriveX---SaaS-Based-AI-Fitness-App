
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likePost } from '@/services/client/clientService'
import { IPost } from '@/types/Post'
import { useSocket } from '@/context/socketContext'

export const useLikePost = () => {
  const queryClient = useQueryClient()
  const { socket, isConnected } = useSocket()

  const mutation = useMutation<IPost, Error, { id: string; role: string; userId: string }>({
    mutationFn: ({ id, role }) => likePost(id, role),
    onMutate: async ({ id, userId }) => {
      await queryClient.cancelQueries(['posts'])
      const previousPosts = queryClient.getQueryData(['posts'])
      queryClient.setQueryData(['posts'], (old: any) => ({
        ...old,
        items: old?.items?.map((post: IPost) =>
          post.id === id
            ? {
                ...post,
                likes: post.likes.includes(userId)
                  ? post.likes.filter((uid: string) => uid !== userId)
                  : [...post.likes, userId],
                hasLiked: !post.likes.includes(userId),
              }
            : post
        ) || [],
      }))
      return { previousPosts }
    },
    onSuccess: (updatedPost, { id, userId, role }) => {
      queryClient.setQueryData(['posts'], (old: any) => ({
        ...old,
        items: old?.items?.map((post: IPost) =>
          post.id === id ? updatedPost : post
        ) || [],
      }))
      queryClient.setQueryData(['post', id], updatedPost)

      if (socket && isConnected) {
        socket.emit("likePost", { postId: id, userId, role })
      }
    },
    onError: (error, { id }, context) => {
      console.error('[DEBUG] Like post error:', error.message)
      queryClient.setQueryData(['posts'], context?.previousPosts)
    },
  })

  return {
    likePost: mutation.mutate,
    isLiking: mutation.isPending,
    error: mutation.error,
    post: mutation.data,
  }
}
