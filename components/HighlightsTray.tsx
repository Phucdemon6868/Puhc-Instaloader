
import React from 'react';
import { HighlightInfo } from '../types';
import { getProxyImageUrl, getBestImageUrl } from '../utils';

interface HighlightsTrayProps {
  highlights: HighlightInfo[];
  isLoading: boolean;
  onHighlightClick: (highlight: HighlightInfo) => void;
}

const HighlightSkeleton: React.FC = () => (
  <div className="flex-shrink-0 text-center animate-pulse">
    <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto ring-2 ring-offset-2 ring-slate-200"></div>
    <div className="mt-2 h-2 w-12 bg-slate-200 rounded mx-auto"></div>
  </div>
);

const HighlightsTray: React.FC<HighlightsTrayProps> = ({ highlights, isLoading, onHighlightClick }) => {
  if (isLoading && highlights.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto mb-8">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2 -mb-2">
            {Array.from({ length: 8 }).map((_, i) => <HighlightSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (highlights.length === 0) {
    return null; // Don't render anything if there are no highlights and we're not loading
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in">
      <div className="flex items-center space-x-4 overflow-x-auto pb-2 -mb-2">
        {highlights.map((highlight) => {
            const coverItem = highlight.items?.[0];
            // Provide a fallback placeholder if a highlight has no items
            const coverUrl = coverItem ? getBestImageUrl(coverItem) : 'https://picsum.photos/150';
            return (
                <button 
                    key={highlight.id} 
                    onClick={() => onHighlightClick(highlight)}
                    className="flex-shrink-0 w-20 text-center group focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 rounded-full"
                    aria-label={`View highlight: ${highlight.title}`}
                >
                    <div className="relative w-16 h-16 mx-auto p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full transition-transform duration-300 group-hover:scale-105">
                        <div className="bg-white p-[2px] rounded-full">
                            <img
                                src={getProxyImageUrl(coverUrl)}
                                alt={highlight.title}
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 truncate group-hover:text-slate-900">{highlight.title}</p>
                </button>
            )
        })}
      </div>
    </div>
  );
};

export default HighlightsTray;