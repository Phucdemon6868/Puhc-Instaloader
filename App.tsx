
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PostInfo, Settings, ProfileInfo, HighlightInfo } from './types';
import SettingsIcon from './components/icons/SettingsIcon';
import ImageIcon from './components/icons/ImageIcon';
import Loader from './components/Loader';
import PostCard from './components/PostCard';
import SettingsModal from './components/SettingsModal';
import InstagramLogo from './components/icons/InstagramLogo';
import ProfileHeader from './components/ProfileHeader';
import PostGrid from './components/PostGrid';
import PostModal from './components/PostModal';
import Footer from './components/Footer';
import HighlightCard from './components/HighlightCard';
import HighlightsTray from './components/HighlightsTray';
import HighlightViewerModal from './components/HighlightViewerModal';
import { API_BASE_URL } from './utils';
import { useToast } from './contexts/ToastContext';

type AppState = 'idle' | 'loading' | 'success' | 'error';
type FetchMode = 'post' | 'profile' | 'highlight';

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [appState, setAppState] = useState<AppState>('idle');
  const [fetchMode, setFetchMode] = useState<FetchMode>('post');
  
  // States
  const [post, setPost] = useState<PostInfo | null>(null);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [highlight, setHighlight] = useState<HighlightInfo | null>(null);
  const [profilePosts, setProfilePosts] = useState<PostInfo[]>([]);
  const [profileHighlights, setProfileHighlights] = useState<HighlightInfo[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostInfo | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightInfo | null>(null);
  const [postsTaskId, setPostsTaskId] = useState<string | null>(null);
  const [highlightsTaskId, setHighlightsTaskId] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [isInitialPostsLoading, setIsInitialPostsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isFetchingHighlights, setIsFetchingHighlights] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    proxy: '',
    docId: '',
    username: '',
    password: '',
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const toast = useToast();

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const resetState = useCallback((keepInput = false) => {
    setAppState('idle');
    setPost(null);
    setProfile(null);
    setHighlight(null);
    setProfilePosts([]);
    setProfileHighlights([]);
    setError(null);
    setLoadMoreError(null);
    setPostsTaskId(null);
    setHighlightsTaskId(null);
    setEndCursor(null);
    setIsInitialPostsLoading(false);
    setIsFetchingMore(false);
    setIsFetchingHighlights(false);
    setTaskStatus(null);
    setIsDownloadingZip(false);
    if (!keepInput) {
        setInputValue('');
    }
  }, []);

  const handleSearch = useCallback(async (searchTerm: string, searchMode: FetchMode) => {
    const searchEndpoints = {
        post: '/api/post',
        profile: '/api/profile',
        highlight: '/api/highlight',
    };
    const searchBody = {
        post: { url: searchTerm, settings },
        profile: { username: searchTerm, settings },
        highlight: { url: searchTerm, settings },
    };
    const errorMessages = {
        post: 'Vui lòng nhập link bài viết.',
        profile: 'Vui lòng nhập tên người dùng.',
        highlight: 'Vui lòng nhập link highlight.'
    };

    if (!searchTerm.trim()) {
      setError(errorMessages[searchMode]);
      setAppState('error');
      return;
    }
    
    setFetchMode(searchMode);
    setInputValue(searchMode === 'profile' ? `@${searchTerm}`: searchTerm);
    resetState(true); // Keep input value
    setAppState('loading');

    try {
        const response = await fetch(`${API_BASE_URL}${searchEndpoints[searchMode]}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchBody[searchMode]),
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch data.');

        if (searchMode === 'post') setPost(data.post);
        if (searchMode === 'profile') {
            setProfile(data.profile);
            setPostsTaskId(data.posts_task_id);
            setHighlightsTaskId(data.highlights_task_id);
            setTaskStatus('PROGRESS');
        }
        if (searchMode === 'highlight') setHighlight(data.highlight);
        
        setAppState('success');

    } catch (err: any) {
      console.error("API Error:", err);
      setError(err.message || 'An unexpected error occurred.');
      setAppState('error');
    }
  }, [settings, resetState]);

  const handleSubmit = useCallback(() => {
    const value = inputValue.trim();
    let mode: FetchMode = 'post';
    let term = value;

    if (value.startsWith('@')) {
        mode = 'profile';
        term = value.substring(1);
    } else if (value.includes('highlights/')) {
        mode = 'highlight';
    }
    
    handleSearch(term, mode);
  }, [inputValue, handleSearch]);

  const handleUsernameClick = useCallback((username: string) => {
    // Close modal if it's open before starting a new search
    if (selectedPost) {
        setSelectedPost(null);
    }
    handleSearch(username, 'profile');
  }, [handleSearch, selectedPost]);


  const handleLoadMore = useCallback(async () => {
    if (!postsTaskId || !endCursor || isFetchingMore) return;

    setIsFetchingMore(true);
    setLoadMoreError(null);
    let hadNewPosts = false;

    try {
        const response = await fetch(`${API_BASE_URL}/api/profile/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: postsTaskId, end_cursor: endCursor }),
        });

        const data = await response.json();
        if (!response.ok && response.status !== 202) throw new Error(data.error || 'Failed to fetch more posts.');
        
        if (data.posts && data.posts.length > 0) {
            hadNewPosts = true;
            setProfilePosts(prevPosts => [...prevPosts, ...data.posts]);
        }
        setEndCursor(data.end_cursor);
    } catch (err: any) {
        setLoadMoreError(err.message || 'Could not load more posts.');
    } finally {
        setTimeout(() => setIsFetchingMore(false), hadNewPosts ? 0 : 2000);
    }
  }, [postsTaskId, endCursor, isFetchingMore]);

  const lastPostElementRef = useCallback(node => {
    if (isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && endCursor) {
        handleLoadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetchingMore, endCursor, handleLoadMore]);


  useEffect(() => {
    if (profile && postsTaskId && profilePosts.length === 0 && appState === 'success') {
      const fetchInitialPosts = async () => {
        setIsInitialPostsLoading(true);
        setLoadMoreError(null);
        let attempts = 0;
        const maxAttempts = 5;

        const attemptFetch = async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/profile/posts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ task_id: postsTaskId, end_cursor: '0' }),
            });
            const data = await response.json();
            if (!response.ok && response.status !== 202) throw new Error(data.error || 'Failed to fetch initial posts.');
            
            if (data.posts && data.posts.length > 0) {
              setProfilePosts(data.posts);
              setEndCursor(data.end_cursor);
              setIsInitialPostsLoading(false);
            } else if (attempts < maxAttempts) {
              attempts++;
              setTimeout(attemptFetch, 1000); // Retry after 1 second
            } else {
              setIsInitialPostsLoading(false);
              // Do not throw an error, just stop loading. User might have 0 posts.
            }
          } catch (err: any) {
            setError(err.message);
            setIsInitialPostsLoading(false);
          }
        };
        attemptFetch();
      };
      fetchInitialPosts();
    }
  }, [profile, postsTaskId, appState, profilePosts.length]);

  useEffect(() => {
    if (fetchMode !== 'profile' || !highlightsTaskId || profileHighlights.length > 0) return;

    let intervalId: number;
    const pollHighlights = async () => {
        if (!isFetchingHighlights) setIsFetchingHighlights(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/profile/highlights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task_id: highlightsTaskId }),
            });
            const data = await response.json();
            if (!response.ok && response.status !== 202) throw new Error(data.error || 'Failed to fetch highlights.');

            if (data.highlights && data.highlights.length > 0) {
                setProfileHighlights(data.highlights);
            }

            if (data.status === 'SUCCESS' || data.status === 'FAILURE') {
                setIsFetchingHighlights(false);
                if (intervalId) clearInterval(intervalId);
            }
        } catch (err: any) {
            console.error("Highlight polling error:", err);
            setIsFetchingHighlights(false);
            if (intervalId) clearInterval(intervalId);
        }
    };
    
    pollHighlights(); // Initial fetch
    intervalId = window.setInterval(pollHighlights, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);

  }, [highlightsTaskId, fetchMode, profileHighlights.length, isFetchingHighlights]);


  useEffect(() => {
    if (!postsTaskId || taskStatus === 'SUCCESS' || taskStatus === 'FAILURE') {
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task_id: postsTaskId, end_cursor: '0' }),
        });
        const data = await response.json();
        if (data.status === 'SUCCESS' || data.status === 'FAILURE') {
            setTaskStatus(data.status);
        } else {
            setTaskStatus('PROGRESS');
        }
      } catch (error) {
        console.error('Polling error:', error);
        setTaskStatus('FAILURE');
      }
    };
    const intervalId = setInterval(checkStatus, 3000);
    return () => clearInterval(intervalId);
  }, [postsTaskId, taskStatus]);


  const handleDownloadZip = async () => {
    if (!profile || !postsTaskId || isDownloadingZip) return;
    
    setIsDownloadingZip(true);
    setLoadMoreError(null);
    toast.info("Đang chuẩn bị và nén file... Vui lòng chờ.");
    try {
        const response = await fetch(`${API_BASE_URL}/api/profile/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: postsTaskId, settings }),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to download zip file.' }));
            throw new Error(errorData.error || 'Failed to download zip file.');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${profile.username}_posts.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Tải xuống đã bắt đầu!");

    } catch (err: any) {
        setLoadMoreError(err.message || 'Could not download zip file.');
        toast.error(err.message || 'Không thể tải file zip.');
    } finally {
        setIsDownloadingZip(false);
    }
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setIsSettingsOpen(false);
  };

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <Loader />;
      case 'success':
        if (fetchMode === 'post' && post) {
            return <PostCard post={post} onUsernameClick={handleUsernameClick} />;
        }
        if (fetchMode === 'profile' && profile) {
            return (
                <div className="w-full">
                    <ProfileHeader 
                        profile={profile}
                        taskStatus={taskStatus}
                        onDownload={handleDownloadZip}
                        isDownloading={isDownloadingZip}
                    />
                    {(isFetchingHighlights || profileHighlights.length > 0) && (
                        <HighlightsTray
                            highlights={profileHighlights}
                            isLoading={isFetchingHighlights && profileHighlights.length === 0}
                            onHighlightClick={setSelectedHighlight}
                        />
                    )}
                    {isInitialPostsLoading ? (
                        <Loader />
                    ) : (
                        <>
                            <PostGrid posts={profilePosts} onPostClick={setSelectedPost} />
                            <div ref={lastPostElementRef} className="h-10" />
                            {isFetchingMore && (
                                <div className="text-center py-4">
                                    <Loader />
                                </div>
                            )}
                        </>
                    )}
                    {loadMoreError && <p className="mt-4 text-red-500 bg-red-100 p-3 rounded-lg">{loadMoreError}</p>}
                </div>
            );
        }
        if (fetchMode === 'highlight' && highlight) {
            return <HighlightCard highlight={highlight} />;
        }
        return null;
      case 'error':
        return <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>;
      case 'idle':
      default:
        return (
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon className="w-20 h-20 mb-4" />
            <p>Nhập để bắt đầu tìm kiếm.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 font-sans text-slate-800">
       <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center h-20 px-4 sm:px-6">
            <div className="flex items-center gap-3">
            <InstagramLogo className="h-10" />
            <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Puhc Instaloader
            </h1>
            </div>
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
                aria-label="Open settings"
            >
                <SettingsIcon className="w-7 h-7" />
            </button>
        </div>
      </header>
      
      <main className="w-full flex-grow flex flex-col items-center pt-20">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-2xl mt-8">
          <div className="space-y-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập @username, link post hoặc highlight..."
              className="w-full px-4 py-3 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              disabled={appState === 'loading'}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={appState === 'loading'}
              className="w-full p-3 text-white font-bold rounded-lg bg-gradient-to-r from-orange-400 to-purple-600 hover:from-orange-500 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {appState === 'loading' ? 'Đang lấy...' : 'Lấy dữ liệu'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Dùng <span className="font-semibold">@username</span> để tìm profile. Dán link cho bài viết hoặc highlight.
          </p>
        </div>

        <div className="mt-8 w-full max-w-4xl text-center text-gray-500">
          {renderContent()}
        </div>
      </main>

      <Footer />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />
      {selectedPost && (
        <PostModal 
            post={selectedPost} 
            settings={settings}
            onClose={() => setSelectedPost(null)}
            onUsernameClick={handleUsernameClick}
        />
      )}
       {selectedHighlight && (
        <HighlightViewerModal
          highlight={selectedHighlight}
          onClose={() => setSelectedHighlight(null)}
        />
      )}
    </div>
  );
};

export default App;
