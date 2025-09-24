
import React, { useState } from 'react';
import { HighlightInfo, MediaItem } from '../types';
import { getProxyImageUrl, getBestImageUrl } from '../utils';
import DownloadIcon from './icons/DownloadIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SaveIcon from './icons/SaveIcon';

interface HighlightCardProps {
  highlight: HighlightInfo;
}

const HighlightCard: React.FC<HighlightCardProps> = ({ highlight }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const prevSlide = () => {
    setCurrentSlide(current => (current === 0 ? highlight.items.length - 1 : current - 1));
  };
  
  const nextSlide = () => {
    setCurrentSlide(current => (current === highlight.items.length - 1 ? 0 : current + 1));
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
    const sanitizedTitle = highlight.title.replace(/[^a-zA-Z0-9]/g, '_');

    for (let i = 0; i < highlight.items.length; i++) {
        const item = highlight.items[i];
        const downloadUrl = item.type === 'video' ? item.video_url : getBestImageUrl(item);
        const filename = `${sanitizedTitle}_${i + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
        
        if (downloadUrl) {
            await handleDownload(getProxyImageUrl(downloadUrl), filename);
        }

        if (i < highlight.items.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    setIsDownloadingAll(false);
  };

  const currentItem = highlight.items[currentSlide];

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md mx-auto text-left overflow-hidden animate-fade-in">
      <div className="p-4 flex justify-between items-center gap-3 border-b border-slate-200">
        <div className="flex items-center gap-3 overflow-hidden">
            <img src={getProxyImageUrl(highlight.owner.avatar)} alt={`${highlight.owner.username}'s profile`} className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className='truncate'>
                <p className="font-semibold text-slate-800 truncate" title={highlight.title}>{highlight.title}</p>
                <p className="text-sm text-slate-500 truncate">by {highlight.owner.username}</p>
            </div>
        </div>
        {highlight.items.length > 0 && (
            <button
                onClick={handleDownloadAll}
                disabled={isDownloadingAll}
                className="flex-shrink-0 p-2 text-slate-600 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-wait"
                aria-label="Download all stories in this highlight"
                title="Tải tất cả"
            >
                {isDownloadingAll ? (
                    <div className="w-5 h-5 border-2 border-t-slate-600 border-r-slate-600 border-b-slate-200 border-l-slate-200 rounded-full animate-spin"></div>
                ) : (
                    <SaveIcon className="w-5 h-5" />
                )}
            </button>
        )}
      </div>
      
      <div className="relative bg-black group w-full aspect-[9/16]">
        <div className="overflow-hidden absolute inset-0">
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {highlight.items.map((item, index) => (
              <div key={item.id} className="relative flex-shrink-0 w-full h-full">
                {item.type === 'image' ? (
                  <img src={getProxyImageUrl(getBestImageUrl(item))} alt={item.accessibility_caption || `Highlight story ${index + 1}`} className="w-full h-full object-contain" />
                ) : (
                  <video src={getProxyImageUrl(item.video_url || "")} controls className="w-full h-full object-contain" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute top-2 left-2 right-2 h-1 flex gap-1 z-10">
            {highlight.items.map((_, index) => (
                <div key={index} className="relative flex-1 h-full bg-white/30 rounded-full overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-white transition-all duration-300"
                        style={{ width: index === currentSlide ? '100%' : '0%' }}
                    />
                </div>
            ))}
        </div>

        {/* Clickable areas for navigation */}
        <div className="absolute top-0 left-0 h-full w-1/3 z-20" onClick={prevSlide} />
        <div className="absolute top-0 right-0 h-full w-1/3 z-20" onClick={nextSlide} />

        <button
          onClick={() => {
            const downloadUrl = currentItem.type === 'video' ? currentItem.video_url : getBestImageUrl(currentItem);
            if (downloadUrl) {
              handleDownload(getProxyImageUrl(downloadUrl), `${highlight.title.replace(/[^a-zA-Z0-9]/g, '_')}_${currentSlide + 1}.${currentItem.type === 'video' ? 'mp4' : 'jpg'}`);
            }
          }}
          className="absolute bottom-3 right-3 bg-black bg-opacity-40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-60 z-30"
          aria-label="Download this story"
        >
          <DownloadIcon className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default HighlightCard;