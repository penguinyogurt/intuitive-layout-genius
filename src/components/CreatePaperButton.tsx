
import React, { useState } from 'react';
import { toast } from 'sonner';

const CreatePaperButton: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const handleCreatePaper = () => {
    toast.success("Creating new paper!", {
      description: "Your new paper will be ready momentarily."
    });
  };

  return (
    <button
      onClick={handleCreatePaper}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`
        w-full py-4 px-6 font-medium text-white uppercase tracking-wide
        rounded-lg shadow-md transition-all duration-300 ease-in-out
        ${isPressed 
          ? 'bg-sky-600 shadow-inner transform scale-95' 
          : isHovering 
            ? 'bg-sky-500 shadow-lg transform scale-105' 
            : 'bg-upload-blue'}
      `}
    >
      Create Paper
    </button>
  );
};

export default CreatePaperButton;
