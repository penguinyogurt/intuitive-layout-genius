
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreatePaperButtonProps {
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  fileData?: any;
}

const CreatePaperButton: React.FC<CreatePaperButtonProps> = ({ 
  isDisabled = false,
  isLoading = false,
  onClick,
  fileData
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const navigate = useNavigate();
  
  const handleCreatePaper = () => {
    if (onClick) {
      onClick();
    } else if (fileData) {
      // Navigate to hypotheses page with the file data
      navigate('/hypotheses', { state: { fileData } });
      toast.success("Analyzing data and generating hypotheses", {
        description: "We'll help you explore different research directions."
      });
    } else {
      toast.error("Please upload and parse an Excel file first");
    }
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
      disabled={isDisabled || isLoading}
      className={`
        w-full py-4 px-6 font-medium text-white uppercase tracking-wide
        rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center justify-center
        ${isDisabled 
          ? 'bg-gray-400 cursor-not-allowed opacity-70' 
          : isPressed && !isLoading
            ? 'bg-sky-600 shadow-inner transform scale-95' 
            : isHovering && !isLoading
              ? 'bg-sky-500 shadow-lg transform scale-105' 
              : 'bg-upload-blue'}
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Generating Paper...
        </>
      ) : (
        "Create Paper"
      )}
    </button>
  );
};

export default CreatePaperButton;
