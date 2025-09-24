
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="w-12 h-12 border-4 border-t-purple-600 border-r-purple-600 border-b-gray-200 border-l-gray-200 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
