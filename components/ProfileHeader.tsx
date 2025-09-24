
import React from 'react';
import { ProfileInfo } from '../types';
import { getProxyImageUrl } from '../utils';
import SaveIcon from './icons/SaveIcon';

interface ProfileHeaderProps {
  profile: ProfileInfo;
  taskStatus: string | null;
  onDownload: () => Promise<void>;
  isDownloading: boolean;
}

const Stat: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="text-center sm:text-left">
    <span className="font-bold text-slate-800 block">{value.toLocaleString()}</span>
    <span className="text-sm text-slate-500">{label}</span>
  </div>
);

const DownloadAllControl: React.FC<Pick<ProfileHeaderProps, 'taskStatus' | 'onDownload' | 'isDownloading'>> = ({ taskStatus, onDownload, isDownloading }) => {
    const isTaskRunning = taskStatus === 'PENDING' || taskStatus === 'PROGRESS';

    if (taskStatus === 'SUCCESS') {
        return (
            <button
                onClick={onDownload}
                disabled={isDownloading}
                className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-wait"
                aria-label="Tải tất cả bài viết"
                title="Tải tất cả (ZIP)"
            >
                {isDownloading 
                    ? <div className="w-5 h-5 border-2 border-t-purple-600 border-r-purple-600 border-b-slate-200 border-l-slate-200 rounded-full animate-spin"></div>
                    : <SaveIcon className="w-5 h-5 text-slate-600" />
                }
            </button>
        );
    }

    if (isTaskRunning) {
        return (
            <div className="flex items-center justify-center w-10 h-10" title="Đang thu thập tất cả bài viết...">
                <div className="w-5 h-5 border-2 border-t-purple-600 border-r-purple-600 border-b-slate-200 border-l-slate-200 rounded-full animate-spin"></div>
            </div>
        );
    }

    return null; // Don't show anything if task failed or in other states
};


const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, taskStatus, onDownload, isDownloading }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl mx-auto p-6 mb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <img
          src={getProxyImageUrl(profile.avatar)}
          alt={`${profile.username}'s profile picture`}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-purple-200 flex-shrink-0"
        />
        <div className="flex-grow w-full space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
             <h2 className="text-2xl font-bold text-slate-800 order-2 sm:order-1">{profile.username}</h2>
             <div className="order-1 sm:order-2">
                <DownloadAllControl 
                    taskStatus={taskStatus} 
                    onDownload={onDownload} 
                    isDownloading={isDownloading} 
                />
             </div>
          </div>
          <div className="flex justify-center sm:justify-start gap-6">
            <Stat value={profile.media_count} label="posts" />
            <Stat value={profile.followers_count} label="followers" />
            <Stat value={profile.following_count} label="following" />
          </div>
           {profile.biography && <p className="text-slate-600 text-sm pt-2 whitespace-pre-wrap">{profile.biography}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
