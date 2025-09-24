import React from 'react';
import { PostInfo } from '../types';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import CarouselIcon from './icons/CarouselIcon';
import VideoIcon from './icons/VideoIcon';
import { getProxyImageUrl, getBestImageUrl } from '../utils';

interface PostGridItemProps {
  post: PostInfo;
  onClick: () => void;
}

const PostGridItem: React.FC<PostGridItemProps> = ({ post, onClick }) => {
  const isCarousel = post.media.length > 1;
  const isVideo = post.media[0]?.type === 'video';
  // Request a medium-quality thumbnail for fast grid loading.
  const thumbnailUrl = getBestImageUrl(post.media[0], 'thumbnail');

  return (
    <button
      onClick={onClick}
      className="relative aspect-square w-full bg-slate-200 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    >
      <img
        src={getProxyImageUrl(thumbnailUrl)}
        alt={post.caption || `Post by ${post.owner.username}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex justify-center items-center">
        <div className="flex items-center gap-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5">
            <HeartIcon className="w-5 h-5" />
            <span className="font-semibold text-sm">
              {post.like_count?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CommentIcon className="w-5 h-5" />
            <span className="font-semibold text-sm">
              {post.comment_count.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      {(isCarousel || isVideo) && (
        <div className="absolute top-2 right-2 text-white">
            {isCarousel && <CarouselIcon className="w-5 h-5 drop-shadow-md" />}
            {isVideo && !isCarousel && <VideoIcon className="w-5 h-5 drop-shadow-md" />}
        </div>
      )}
    </button>
  );
};

export default PostGridItem;
