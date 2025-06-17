import React from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { IPostEntity } from '../index';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { selectCurrentUser } from '@/store/userSelectors';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useDeletePost } from '@/hooks/community/useDeletePost';
import { useReportPost } from '@/hooks/community/useReportPost';
export const ROLES = {
  ADMIN: "admin",
  USER: "client",
  TRAINER: "trainer",
} as const;
export type RoleType = (typeof ROLES)[keyof typeof ROLES];
interface PostDetailHeaderProps {
  post: IPostEntity;
}

const PostDetailHeader: React.FC<PostDetailHeaderProps> = ({ post }) => {
  const currentUser = useSelector(selectCurrentUser);
  const { deletePost, isDeleting } = useDeletePost();
  const { reportPost, isReporting } = useReportPost();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleDelete = () => {
    if (currentUser?.role) {
      deletePost(
        { id: post.id ?? '', role: currentUser.role },
        {
          onSuccess: () => toast.success('Post deleted'),
          onError: (err) => toast.error(err.message || 'Failed to delete post'),
        }
      );
    }
  };

  const handleReport = () => {
    if (currentUser?.role) {
      reportPost(
        { id: post.id ?? '', reason: 'Inappropriate content', role: currentUser.role },
        {
          onSuccess: () => toast.success('Post reported'),
          onError: (err) => toast.error(err.message || 'Failed to report post'),
        }
      );
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10 border-2 border-purple-100 shadow-sm">
          {post.author?.profileImage ? (
            <AvatarImage 
              src={post.author.profileImage || "/placeholder.svg"} 
              alt={`${post.author.firstName} ${post.author.lastName}`} 
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-violet-600 text-white font-medium">
              {post.author ? getInitials(post.author.firstName, post.author.lastName) : 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="flex items-center">
            <p className="text-sm font-semibold text-gray-900">
              {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Unknown User'}
            </p>
            {post.role === ('trainer' as RoleType) && (
              <Badge
                variant="outline"
                className="ml-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs py-0.5 px-1.5 border-0"
              >
                Pro
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">{formatTimeAgo(new Date(post.createdAt))}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border border-gray-100 p-1">
          <DropdownMenuItem 
            onClick={handleReport} 
            disabled={isReporting}
            className="text-sm py-2 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors"
          >
            Report
          </DropdownMenuItem>
          {post.authorId === currentUser?.id && (
            <>
              <DropdownMenuItem className="text-sm py-2 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors">
                Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="text-sm py-2 cursor-pointer rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              >
                Delete Post
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem className="text-sm py-2 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors">
            Copy Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PostDetailHeader;
