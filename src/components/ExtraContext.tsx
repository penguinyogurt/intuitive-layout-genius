
import React from 'react';

interface ExtraContextProps {
  children?: React.ReactNode;
}

const ExtraContext: React.FC<ExtraContextProps> = ({ children }) => {
  return (
    <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm animate-fade-in">
      <div className="text-gray-500 text-sm">
        {children || "Extra context..."}
      </div>
    </div>
  );
};

export default ExtraContext;
