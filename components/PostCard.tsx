
import React, { useState } from 'react';
import { PostInfo } from '../types';
import HeartIcon from './icons/HeartIcon';
import CommentIcon from './icons/CommentIcon';
import DownloadIcon from './icons/DownloadIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SaveIcon from './icons/SaveIcon';
import { getProxyImageUrl, getBestImageUrl } from '../utils';

interface PostCardProps {
  post: PostInfo;
  onUsernameClick?: (username: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUsernameClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const isCarousel = post.media.length > 1;

  const prevSlide = () => {
    setCurrentSlide(current => (current === 0 ? post.media.length - 1 : current - 1));
  };
  
  const nextSlide = () => {
    setCurrentSlide(current => (current === post.media.length - 1 ? 0 : current + 1));
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok.');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in a new tab
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.target = '_blank';
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    for (let i = 0; i < post.media.length; i++) {
        const item = post.media[i];
        const downloadUrl = item.type === 'video' ? item.video_url : getBestImageUrl(item);
        const filename = `${post.shortcode}_${i + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
        
        if (downloadUrl) {
            await handleDownload(downloadUrl, filename);
        }

        if (i < post.media.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    setIsDownloadingAll(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-auto text-left overflow-hidden animate-fade-in">
      <div className="p-4 flex justify-between items-center gap-3 border-b border-slate-200">
        <div className="flex items-center gap-3 overflow-hidden">
            <img src={getProxyImageUrl(post.owner.avatar)} alt={`${post.owner.username}'s profile`} className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="truncate">
                {onUsernameClick ? (
                    <button 
                        onClick={() => onUsernameClick(post.owner.username)}
                        className="font-semibold text-slate-800 truncate hover:underline focus:outline-none"
                        title={`View profile of ${post.owner.username}`}
                    >
                        {post.owner.username}
                    </button>
                ) : (
                    <span className="font-semibold text-slate-800 truncate">{post.owner.username}</span>
                )}
                {post.is_private && <span className="ml-2 text-xs bg-gray-200 text-gray-600 font-bold px-2 py-1 rounded-full">PRIVATE</span>}
            </div>
        </div>
        {post.media.length > 0 && (
            <button
                onClick={handleDownloadAll}
                disabled={isDownloadingAll}
                className="flex-shrink-0 p-2 text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-wait"
                aria-label="Download all media in this post"
            >
                {isDownloadingAll ? (
                    <div className="w-5 h-5 border-2 border-t-slate-600 border-r-slate-600 border-b-slate-200 border-l-slate-200 rounded-full animate-spin"></div>
                ) : (
                    <SaveIcon className="w-5 h-5" />
                )}
            </button>
        )}
      </div>
      
      <div className="relative bg-black group">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {post.media.map((item, index) => (
              <div key={item.id} className="relative flex-shrink-0 w-full">
                {item.type === 'image' ? (
                  <img src={getProxyImageUrl(getBestImageUrl(item))} alt={item.accessibility_caption || `Post image ${index + 1}`} className="w-full h-auto max-h-[75vh] object-contain" />
                ) : (
                  <video src={item.video_url} controls className="w-full h-auto max-h-[75vh]" />
                )}
                <button
                  onClick={() => {
                    const downloadUrl = item.type === 'video' ? item.video_url : getBestImageUrl(item);
                    if (downloadUrl) {
                      handleDownload(downloadUrl, `${post.shortcode}_${index + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}`);
                    }
                  }}
                  className="absolute top-3 right-3 bg-black bg-opacity-40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-60"
                  aria-label="Download media"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {isCarousel && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {post.media.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white scale-110' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-1.5">
            <HeartIcon className="w-6 h-6" />
            <span className="font-semibold">{post.like_count?.toLocaleString() || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CommentIcon className="w-6 h-6" />
            <span className="font-semibold">{post.comment_count.toLocaleString()}</span>
          </div>
        </div>
        
        {post.caption && (
          <p className="text-slate-700 text-sm whitespace-pre-wrap">
            <span className="font-semibold text-slate-800 mr-1.5">{post.owner.username}</span>
            {post.caption}
          </p>
        )}
        
        <p className="text-xs text-slate-400 uppercase">
          {new Date(post.taken_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
};

export default PostCard;
