
import React, { useCallback, useState } from 'react';
import { Cloud, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  maxFileSize: string;
  supportedFileTypes: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  maxFileSize = "90GB", 
  supportedFileTypes = ["CSV", "XLSX", "JSON"] 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      toast.success(`${files.length} file(s) selected`, {
        description: "Files ready for upload."
      });
      console.log('Files dropped:', files);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast.success(`${files.length} file(s) selected`, {
        description: "Files ready for upload."
      });
      console.log('Files selected:', files);
    }
  };

  return (
    <div className="flex flex-col w-full gap-10 items-center justify-center">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-xl aspect-[3/2] drop-zone-border flex flex-col items-center justify-center px-6 py-10 transition-all duration-300 ease-in-out
          ${isDragging ? 'drop-zone-border-active bg-blue-50 scale-105' : 'bg-white'}
          hover:border-gray-400 focus:border-upload-blue`}
      >
        <div className="flex flex-col items-center gap-4 staggered-fade-in">
          <Cloud 
            className={`w-20 h-20 text-upload-blue animate-float ${isDragging ? 'text-upload-lightblue animate-pulse-subtle' : ''}`} 
            strokeWidth={1.5} 
          />
          <div className="flex flex-col items-center gap-1">
            <p className="text-lg font-medium text-gray-700">Drag Files to Upload</p>
            <span className="text-sm text-gray-500">or</span>
          </div>
          
          <label 
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`button-transition px-6 py-2 border-2 border-upload-blue rounded-full text-upload-blue font-medium cursor-pointer
              ${isHovering ? 'bg-blue-50' : 'bg-white'}`}
          >
            Browse Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
          </label>
          
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-500">Max File Size: <span className="font-medium">{maxFileSize}</span></p>
            <p className="text-sm text-gray-500">
              Supported File Types: <span className="font-medium">{supportedFileTypes.join(', ')}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
