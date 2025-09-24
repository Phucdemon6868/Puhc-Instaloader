
import React, { useState, useEffect, useCallback } from 'react';
import { PostInfo, Settings } from '../types';
import PostCard from './PostCard';
import Loader from './Loader';
import { API_BASE_URL } from '../utils';

interface PostModalProps {
  post: PostInfo;
  settings: Settings;
  onClose: () => void;
  onUsernameClick: (username: string) => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, settings, onClose, onUsernameClick }) => {
  const [fullPost, setFullPost] = useState<PostInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch full post details when the modal is opened for a new post
  useEffect(() => {
    // A simple heuristic to check if we have the full data.
    // Data from the profile grid view often lacks `like_count`.
    const isThumbnailData = typeof post.like_count === 'undefined';

    if (isThumbnailData) {
      setIsLoading(true);
      setError(null);
      setFullPost(null);

      const fetchFullPost = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: post.shortcode, settings }),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch high-quality post.');
          }
          setFullPost(data.post);
        } catch (err: any) {
          console.error("Error fetching full post:", err);
          setError(err.message || 'Could not load full post details.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchFullPost();
    } else {
      // If we already have full data (e.g., from a single post fetch), just display it.
      setFullPost(post);
      setIsLoading(false);
      setError(null);
    }
  }, [post, settings]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleKeyDown]);

  const renderContent = () => {
    if (isLoading) {
      // Show the low-quality post card as a placeholder while loading for a seamless UX.
      return (
        <div className="relative">
          <div className="opacity-50 blur-sm">
            <PostCard post={post} onUsernameClick={onUsernameClick} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader />
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-auto p-8 text-center">
          <h3 className="font-bold text-lg text-red-600 mb-2">Không thể tải ảnh chất lượng cao</h3>
          <p className="text-sm text-slate-600 mb-4">Vẫn hiển thị phiên bản xem trước.</p>
          <PostCard post={post} onUsernameClick={onUsernameClick} />
          <p className="mt-4 text-red-500 bg-red-100 p-3 rounded-lg text-xs">{error}</p>
        </div>
      );
    }
    if (fullPost) {
      return <PostCard post={fullPost} onUsernameClick={onUsernameClick} />;
    }
    // Fallback to the original post if something goes wrong.
    return <PostCard post={post} onUsernameClick={onUsernameClick} />;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 sm:top-2 sm:right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
          aria-label="Close post view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PostModal;
