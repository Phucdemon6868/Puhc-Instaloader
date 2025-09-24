import React from 'react';
import { PostInfo } from '../types';
import PostGridItem from './PostGridItem';

interface PostGridProps {
  posts: PostInfo[];
  onPostClick: (post: PostInfo) => void;
}

const PostGrid: React.FC<PostGridProps> = ({ posts, onPostClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-4 animate-fade-in">
      {posts.map((post) => (
        <PostGridItem
          key={post.id}
          post={post}
          onClick={() => onPostClick(post)}
        />
      ))}
    </div>
  );
};

export default PostGrid;
