
import React, { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: Settings) => void;
  currentSettings: Settings;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
  const [settings, setSettings] = useState<Settings>(currentSettings);

  // Effect to sync settings from props when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setSettings(currentSettings);
    }
  }, [currentSettings, isOpen]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Effect to add/remove Escape key listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-6 text-slate-800">Cài đặt</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Proxy String</label>
            <input
              type="text"
              name="proxy"
              value={settings.proxy}
              onChange={handleChange}
              placeholder="host:port:user:pass"
              className="w-full px-4 py-2 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1 block">Doc ID</label>
            <input
              type="text"
              name="docId"
              value={settings.docId}
              onChange={handleChange}
              placeholder="Optional custom Doc ID"
              className="w-full px-4 py-2 bg-slate-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;