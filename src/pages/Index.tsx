import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import ExtraContext from '../components/ExtraContext';
import CreatePaperButton from '../components/CreatePaperButton';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const Index: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileData, setFileData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<string | null>(null);

  // Add animation effects when component mounts
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('fade-up');
      }, index * 150);
    });
  }, []);

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        readExcelFile(file);
      } else {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
      }
    }
  };

  const readExcelFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setFileData(jsonData);
        
        toast.success('Excel file parsed successfully', {
          description: `Found ${jsonData.length} rows of data`
        });
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error('Failed to parse Excel file');
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - File Upload */}
          <div className="lg:col-span-2 animate-on-mount">
            <FileUpload 
              maxFileSize="90GB" 
              supportedFileTypes={["XLSX", "XLS"]} 
              onFilesSelected={handleFilesSelected}
            />
            
            {generatedPaper && (
              <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Generated Research Paper</h2>
                <div className="prose max-w-none overflow-auto max-h-[500px] p-4 bg-gray-50 rounded-md">
                  <pre className="whitespace-pre-wrap">{generatedPaper}</pre>
                </div>
              </div>
            )}
          </div>
          
          {/* Right column - Extra Context & Create Paper */}
          <div className="flex flex-col gap-6">
            <div className="animate-on-mount" style={{animationDelay: '150ms'}}>
              <ExtraContext onGeneratePaper={(prompt) => {
                // This is kept for backward compatibility
                // New flow uses the multi-step process via CreatePaperButton
                return Promise.resolve();
              }} />
            </div>
            
            <div className="animate-on-mount" style={{animationDelay: '300ms'}}>
              <CreatePaperButton 
                isDisabled={!fileData} 
                isLoading={isGenerating}
                fileData={fileData}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
