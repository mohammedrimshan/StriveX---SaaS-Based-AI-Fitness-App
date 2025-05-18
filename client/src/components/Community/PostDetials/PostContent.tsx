import React from 'react';
import { IPostEntity } from '../index';
import { Badge } from '@/components/ui/badge';

interface PostContentProps {
  post: IPostEntity;
}

const PostContent: React.FC<PostContentProps> = ({ post }) => {
  return (
    <div className="p-4 border-b">
      <Badge 
        variant="secondary" 
        className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-medium mb-2 px-2.5 py-0.5 rounded-full"
      >
        {post.category}
      </Badge>
      <p className="text-sm text-gray-800 mt-2 leading-relaxed">{post.textContent}</p>
    </div>
  );
};

export default PostContent;
