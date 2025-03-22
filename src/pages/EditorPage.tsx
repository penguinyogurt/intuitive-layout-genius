
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PaperEditor from '../components/PaperEditor';
import ChatSidebar from '../components/ChatSidebar';
import { toast } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';

const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fileData, setFileData] = useState<any>(null);
  const [hypothesis, setHypothesis] = useState<any>(null);
  const [paperContent, setPaperContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  
  useEffect(() => {
    // Get the data from location state
    if (location.state?.fileData && location.state?.hypothesis) {
      setFileData(location.state.fileData);
      setHypothesis(location.state.hypothesis);
      generatePaper(location.state.fileData, location.state.hypothesis);
    } else {
      toast.error("Missing required data. Please start over.");
      navigate('/');
    }
  }, [location.state, navigate]);

  const generatePaper = async (data: any, hypothesis: any) => {
    setIsGenerating(true);
    try {
      // Format data for prompt
      const dataPreview = JSON.stringify(data.slice(0, 10), null, 2);
      const totalRows = data.length;
      const columns = Object.keys(data[0] || {}).join(', ');
      
      const prompt = `
You are a research scientist analyzing the following dataset:

Data columns: ${columns}
Total records: ${totalRows}
Data preview: ${dataPreview}

Based on this data, please write a complete academic research paper exploring the following hypothesis:
${hypothesis.title}
${hypothesis.description}

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
      
      setPaperContent(generatedContent);
      setIsGenerating(false);
      
    } catch (error) {
      console.error('Error generating paper:', error);
      toast.error('Failed to generate research paper');
      setIsGenerating(false);
      // Set fallback content
      setPaperContent("# Error Generating Research Paper\n\nWe encountered an issue generating the research paper based on your selected hypothesis. Please try again or select a different hypothesis.");
    }
  };

  const handlePaperUpdate = (newContent: string) => {
    setPaperContent(newContent);
  };

  const handleAIUpdate = async (prompt: string) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { 
              role: 'system', 
              content: 'You are a helpful research assistant. You are helping a user modify their research paper. Provide the full updated research paper with the requested changes incorporated.' 
            },
            { 
              role: 'user', 
              content: `Here is my current research paper:\n\n${paperContent}\n\nPlease update it based on this request: ${prompt}` 
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const updatedContent = result.choices[0].message.content;
      
      setPaperContent(updatedContent);
      return true;
      
    } catch (error) {
      console.error('Error updating paper with AI:', error);
      toast.error('Failed to update research paper');
      return false;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        <div className="flex flex-1 w-full">
          <ChatSidebar 
            hypothesis={hypothesis} 
            onSendMessage={handleAIUpdate} 
          />
          
          <main className="flex-1">
            <PaperEditor 
              content={paperContent}
              isLoading={isGenerating}
              onContentChange={handlePaperUpdate}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EditorPage;
