import React from "react";

interface ProgressBarProps {
  progress: number; // Define prop type
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full max-w-md p-4 rounded-lg shadow-md">
      <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
        <div
          className="h-full bg-green-700 transition-all duration-500 text-center pl-2" style={{ width: `${progress}%` }}>
          {progress}%
        </div>
      </div>

    </div>
  );
};

export default ProgressBar;