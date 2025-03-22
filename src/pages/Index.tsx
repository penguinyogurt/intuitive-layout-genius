
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

  const generatePaperWithAI = async (instructions: string) => {
    if (!fileData) {
      toast.error('Please upload and parse an Excel file first');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Format data for prompt
      const dataPreview = JSON.stringify(fileData.slice(0, 10), null, 2);
      const totalRows = fileData.length;
      const columns = Object.keys(fileData[0] || {}).join(', ');
      
      const prompt = `
You are a research scientist analyzing the following dataset:

Data columns: ${columns}
Total records: ${totalRows}
Data preview: ${dataPreview}

${instructions}

Format your response as a complete academic research paper with proper sections, including abstract, introduction, methodology, results, discussion, and conclusion. Cite any relevant literature where appropriate. Generate appropriate figures and tables descriptions based on the data.
`;

      // Make API call to Groq
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: 'You are a helpful research assistant that analyzes data and generates academic research papers.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const generatedContent = result.choices[0].message.content;
      
      setGeneratedPaper(generatedContent);
      setIsGenerating(false);
      
      toast.success('Research paper generated successfully!');
      
      // Create a downloadable file
      const blob = new Blob([generatedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'research_paper.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error generating paper:', error);
      toast.error('Failed to generate paper with AI');
      setIsGenerating(false);
    }
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
              <ExtraContext onGeneratePaper={generatePaperWithAI} />
            </div>
            
            <div className="animate-on-mount" style={{animationDelay: '300ms'}}>
              <CreatePaperButton 
                isDisabled={!fileData || isGenerating} 
                isLoading={isGenerating}
                onClick={() => generatePaperWithAI(
                  "Analyze the data, identify patterns, and create a comprehensive research paper with proper sections including introduction, methodology, results, discussion, and conclusion."
                )}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
