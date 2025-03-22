
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PaperEditor from '../components/PaperEditor';
import ChatSidebar from '../components/ChatSidebar';
import { toast } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';

// Groq API key (use environment variable in production)
const GROQ_API_KEY = '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';

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
      const dataPreview = JSON.stringify(data.slice(0, 5), null, 2); // Reduced to 5 rows
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

Format your response as a complete academic research paper with proper sections following professional academic standards:
1. Title Page - Include a descriptive title, author information, and date
2. Abstract - A concise summary of the research (150-250 words)
3. Introduction - Background information, problem statement, and significance of the research
4. Literature Review - Synthesize relevant prior research
5. Methodology - Detailed explanation of data analysis methods
6. Results - Present findings with appropriate statistical analysis
7. Discussion - Interpret results in context of the hypothesis and existing literature
8. Conclusion - Summarize findings, implications, and suggestions for future research
9. References - Properly formatted citations

Use markdown formatting to structure the document. Include appropriate headers, paragraphs, lists, and emphasis. 
Describe data visualizations and statistical tables that would support your analysis, even if you cannot generate actual images.
Make sure the paper follows professional academic standards and formatting conventions.
`;

      console.log("Sending request to Groq API...");
      
      // Make API call to Groq
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Use smaller model to avoid rate limits
          messages: [
            { role: 'system', content: 'You are a professional academic researcher with expertise in writing research papers according to academic standards. Format your response in proper markdown following all professional academic conventions.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 3000 // Reduced token count
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Groq API error response:', errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Received response from Groq API");
      const generatedContent = result.choices[0].message.content;
      
      setPaperContent(generatedContent);
      toast.success("Research paper generated successfully");
      
    } catch (error) {
      console.error('Error generating paper:', error);
      toast.error('Failed to generate research paper');
      // Set fallback content
      setPaperContent(`# Error Generating Research Paper

We encountered an issue generating the research paper based on your selected hypothesis. Please try again or select a different hypothesis.

## Possible reasons:
- API rate limit exceeded (please try again in a minute)
- Network connectivity issues
- Data format issues

If you continue to experience problems, please try using a smaller dataset or a different hypothesis.`);
    } finally {
      setIsGenerating(false);
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
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Use smaller model to avoid rate limits
          messages: [
            { 
              role: 'system', 
              content: 'You are a professional academic researcher with expertise in writing research papers according to academic standards. Format your response in proper markdown following professional academic conventions.' 
            },
            { 
              role: 'user', 
              content: `Here is my current research paper:\n\n${paperContent}\n\nPlease update it based on this request: ${prompt}\n\nMaintain professional academic formatting and standards in your response. The entire response should be the complete updated paper in markdown format.` 
            }
          ],
          temperature: 0.7,
          max_tokens: 3000 // Reduced token count
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Groq API error response:', errorData);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const updatedContent = result.choices[0].message.content;
      
      setPaperContent(updatedContent);
      toast.success("Research paper updated successfully");
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
