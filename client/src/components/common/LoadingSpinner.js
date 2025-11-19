// client/src/components/common/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p className="ml-3 text-gray-600">Loading data...</p>
    </div>
  );
};

export default LoadingSpinner;