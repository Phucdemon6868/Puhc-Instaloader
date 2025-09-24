
import React, { useState, useEffect, useCallback } from 'react';
import { HighlightInfo } from '../types';
import { getProxyImageUrl, getBestImageUrl } from '../utils';

interface HighlightViewerModalProps {
  highlight: HighlightInfo;
  onClose: () => void;
}

const HighlightViewerModal: React.FC<HighlightViewerModalProps> = ({ highlight, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance logic for images
  useEffect(() => {
    if (isPaused || !highlight.items[currentSlide] || highlight.items[currentSlide].type === 'video') {
        return;
    }

    const timer = setTimeout(() => {
      if (currentSlide < highlight.items.length - 1) {
        setCurrentSlide(s => s + 1);
      } else {
        onClose(); // Close modal after the last story
      }
    }, 5000); // 5 second timer

    return () => clearTimeout(timer);
  }, [currentSlide, highlight.items, isPaused, onClose]);
  
  // Close on Escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleKeyDown]);
  
  const prevSlide = () => setCurrentSlide(s => (s === 0 ? 0 : s - 1));
  const nextSlide = () => {
    if (currentSlide === highlight.items.length - 1) {
      onClose();
    } else {
      setCurrentSlide(s => s + 1);
    }
  };

  const currentItem = highlight.items[currentSlide];

  if (!currentItem) return null; // In case highlight has no items

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-md max-h-[95vh] aspect-[9/16] bg-black rounded-2xl overflow-hidden flex items-center justify-center" onClick={e => e.stopPropagation()}>
        
        {/* Media */}
        <div className="absolute inset-0">
          {currentItem.type === 'image' ? (
            <img src={getProxyImageUrl(getBestImageUrl(currentItem))} className="w-full h-full object-contain" alt={currentItem.accessibility_caption || ''} />
          ) : (
            <video 
                src={getProxyImageUrl(currentItem.video_url || "")} 
                className="w-full h-full object-contain" 
                autoPlay 
                onPlay={() => setIsPaused(true)} 
                onPause={() => setIsPaused(false)}
                onEnded={() => { setIsPaused(false); nextSlide(); }} 
                controls={false}
            />
          )}
        </div>
        
        {/* Header & Progress Bars */}
        <div className="absolute top-0 left-0 right-0 p-3 z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-1 h-1 mb-3">
            {highlight.items.map((_, index) => (
                <div key={index} className="relative flex-1 h-full bg-white/30 rounded-full overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-white"
                        style={{ 
                            width: index < currentSlide ? '100%' : (index === currentSlide ? '100%' : '0%'), 
                            transition: (index === currentSlide && !isPaused && currentItem.type !== 'video') ? 'width 5s linear' : 'none' 
                        }}
                    />
                </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <img src={getProxyImageUrl(highlight.owner.avatar)} className="w-8 h-8 rounded-full" alt={`${highlight.owner.username}'s avatar`} />
            <span className="text-white font-semibold text-sm">{highlight.owner.username}</span>
          </div>
        </div>

        {/* Navigation Overlays */}
        <div className="absolute top-0 left-0 h-full w-1/3 z-10" onClick={prevSlide} />
        <div className="absolute top-0 right-0 h-full w-1/3 z-10" onClick={nextSlide} />
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 text-white z-30 p-1 bg-black/30 rounded-full hover:bg-black/50" aria-label="Close highlight viewer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default HighlightViewerModal;
