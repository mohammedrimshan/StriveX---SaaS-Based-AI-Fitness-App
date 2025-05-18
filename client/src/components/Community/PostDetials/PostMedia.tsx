import React from 'react';

interface PostMediaProps {
  mediaUrl?: string;
}

const PostMedia: React.FC<PostMediaProps> = ({ mediaUrl }) => {
  if (!mediaUrl) return null;

  return (
    <div className="md:w-1/2 md:max-h-full h-[350px] md:h-auto bg-black flex items-center justify-center">
      <img 
        src={mediaUrl || "/placeholder.svg"} 
        alt="Post media" 
        className="h-full w-full object-contain" 
      />
    </div>
  );
};

export default PostMedia;
