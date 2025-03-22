
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import ExtraContext from '../components/ExtraContext';
import CreatePaperButton from '../components/CreatePaperButton';

const Index: React.FC = () => {
  // Add animation effects when component mounts
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('fade-up');
      }, index * 150);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - File Upload */}
          <div className="lg:col-span-2 animate-on-mount">
            <FileUpload 
              maxFileSize="90GB" 
              supportedFileTypes={["CSV", "XLSX", "JSON"]} 
            />
          </div>
          
          {/* Right column - Extra Context & Create Paper */}
          <div className="flex flex-col gap-6">
            <div className="animate-on-mount" style={{animationDelay: '150ms'}}>
              <ExtraContext />
            </div>
            
            <div className="animate-on-mount" style={{animationDelay: '300ms'}}>
              <CreatePaperButton />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
