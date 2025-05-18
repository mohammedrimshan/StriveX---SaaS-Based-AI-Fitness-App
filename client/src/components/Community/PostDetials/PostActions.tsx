import React from 'react';
import { Heart, MessageSquare, Share, Bookmark } from 'lucide-react';

interface PostActionsProps {
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  likeCount,
  commentCount,
  isLiked,
  isSaved,
  onLike,
  onSave,
}) => {
  return (
    <div className="flex justify-between p-4 border-b">
      <div className="flex space-x-6">
        <button
          onClick={onLike}
          className="flex items-center space-x-2 transition-colors group"
        >
          <div className={`p-1.5 rounded-full ${isLiked ? 'bg-pink-50' : 'group-hover:bg-pink-50'} transition-colors`}>
            <Heart 
              className={`h-5 w-5 ${
                isLiked 
                  ? 'fill-pink-500 text-pink-500' 
                  : 'text-gray-700 group-hover:text-pink-500'
              } transition-colors`} 
            />
          </div>
          <span className={`text-sm font-medium ${isLiked ? 'text-pink-500' : 'text-gray-700'}`}>
            {likeCount > 0 ? likeCount : ''}
          </span>
        </button>
        
        <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 transition-colors group">
          <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">
            {commentCount > 0 ? commentCount : ''}
          </span>
        </button>
        
        <button className="flex items-center space-x-2 text-gray-700 hover:text-green-500 transition-colors group">
          <div className="p-1.5 rounded-full group-hover:bg-green-50 transition-colors">
            <Share className="h-5 w-5" />
          </div>
        </button>
      </div>
      
      <button
        onClick={onSave}
        className="group transition-colors"
      >
        <div className={`p-1.5 rounded-full ${isSaved ? 'bg-purple-50' : 'group-hover:bg-purple-50'} transition-colors`}>
          <Bookmark 
            className={`h-5 w-5 ${
              isSaved 
                ? 'fill-purple-500 text-purple-500' 
                : 'text-gray-700 group-hover:text-purple-500'
            } transition-colors`} 
          />
        </div>
      </button>
    </div>
  );
};

export default PostActions;
