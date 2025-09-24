
import React, { useEffect, useState } from 'react';
import InfoIcon from './icons/InfoIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface ToastProps {
  message: string;
  type: 'info' | 'success' | 'error';
  onDismiss: () => void;
}

const toastConfig = {
  info: {
    bg: 'bg-slate-800',
    icon: <InfoIcon className="w-6 h-6 text-slate-300" />,
  },
  success: {
    bg: 'bg-green-600',
    icon: <CheckCircleIcon className="w-6 h-6 text-white" />,
  },
  error: {
    bg: 'bg-red-600',
    icon: <XCircleIcon className="w-6 h-6 text-white" />,
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  const [exiting, setExiting] = useState(false);
  const duration = 3000; // 3 seconds

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300); // Allow time for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [onDismiss, duration]);
  
  const config = toastConfig[type];

  return (
    <div
      className={`flex items-center gap-3 w-full max-w-sm mx-auto px-4 py-3 rounded-xl shadow-lg text-white ${config.bg} animate-toast-in ${exiting ? 'animate-toast-out' : ''}`}
      role="alert"
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <p className="text-sm font-medium flex-grow text-left">{message}</p>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toast-out {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-100%); }
        }
        .animate-toast-in { animation: toast-in 0.3s ease-out forwards; }
        .animate-toast-out { animation: toast-out 0.3s ease-in forwards; }
      `}</style>
    </div>
  );
};

export default Toast;
