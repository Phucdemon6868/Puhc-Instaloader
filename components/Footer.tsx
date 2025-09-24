
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center p-6 mt-12 border-t border-slate-200">
      <div className="flex justify-center flex-wrap gap-4 sm:gap-6 mb-4">
        <a href="#" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">Meta</a>
        <a href="#" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">About</a>
        <a href="#" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">Blog</a>
        <a href="#" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">Privacy</a>
        <a href="#" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">Terms</a>
        <a href="#" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">API</a>
      </div>
      <p className="text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Puhc Instaloader. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
