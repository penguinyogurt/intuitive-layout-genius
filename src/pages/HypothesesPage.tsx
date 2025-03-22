
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Hypothesis {
  id: number;
  title: string;
  description: string;
}

const HypothesesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [selectedHypothesis, setSelectedHypothesis] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fileData, setFileData] = useState<any>(null);

  useEffect(() => {
    // Get the fileData from location state
    if (location.state?.fileData) {
      setFileData(location.state.fileData);
      generateHypotheses(location.state.fileData);
    } else {
      toast.error("No data available. Please upload a file first.");
      navigate('/');
    }
  }, [location.state, navigate]);

  const generateHypotheses = async (data: any) => {
    setIsLoading(true);
    try {
      // Format data for prompt
      const dataPreview = JSON.stringify(data.slice(0, 5), null, 2);
      const totalRows = data.length;
      const columns = Object.keys(data[0] || {}).join(', ');
      
      const prompt = `
You are a research scientist analyzing the following dataset:

Data columns: ${columns}
Total records: ${totalRows}
Data preview: ${dataPreview}

Generate 3 different hypotheses based on this data that could be explored in a research paper. 
For each hypothesis:
1. Provide a clear title (1 sentence)
2. Write a brief description explaining the hypothesis and why it's interesting (2-3 sentences)
3. Make sure each hypothesis explores a different aspect of the data

Format your response as JSON:
[
  {
    "id": 1,
    "title": "Hypothesis 1 title",
    "description": "Description of hypothesis 1"
  },
  ...
]
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
            { role: 'system', content: 'You are a helpful research assistant that analyzes data and generates research hypotheses.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const generatedHypotheses = JSON.parse(result.choices[0].message.content);
      
      setHypotheses(generatedHypotheses);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error generating hypotheses:', error);
      toast.error('Failed to generate hypotheses');
      setIsLoading(false);
      // Provide fallback hypotheses if API fails
      setHypotheses([
        {
          id: 1,
          title: "Correlation between variables in the dataset",
          description: "This hypothesis explores potential correlations between key variables in the dataset. Understanding these relationships could provide insights into underlying patterns."
        },
        {
          id: 2,
          title: "Time-based trends in the dataset",
          description: "This hypothesis examines how values change over time. Identifying temporal patterns could reveal seasonal effects or long-term trends."
        },
        {
          id: 3, 
          title: "Comparison of different groups within the dataset",
          description: "This hypothesis compares different categories or groups within the data. Analyzing group differences may highlight important distinctions or similarities."
        }
      ]);
    }
  };

  const handleHypothesisSelect = (id: number) => {
    setSelectedHypothesis(id);
  };

  const handleContinue = () => {
    if (selectedHypothesis === null) {
      toast.error("Please select a hypothesis");
      return;
    }

    const selectedHypothesisData = hypotheses.find(h => h.id === selectedHypothesis);
    
    navigate('/editor', { 
      state: { 
        fileData: fileData,
        hypothesis: selectedHypothesisData
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold mb-8 text-gray-800">Select a Research Hypothesis</h1>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-sky-500 mb-4" />
              <p className="text-gray-600">Analyzing your data and generating hypotheses...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 mb-10">
                {hypotheses.map((hypothesis) => (
                  <div 
                    key={hypothesis.id}
                    className={`
                      p-6 border rounded-xl transition-all duration-200 cursor-pointer
                      ${selectedHypothesis === hypothesis.id 
                        ? 'border-sky-500 bg-sky-50 shadow-md' 
                        : 'border-gray-200 bg-white hover:border-sky-300 hover:shadow-sm'}
                    `}
                    onClick={() => handleHypothesisSelect(hypothesis.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1
                        ${selectedHypothesis === hypothesis.id 
                          ? 'bg-sky-500 text-white' 
                          : 'border border-gray-300'}
                      `}>
                        {selectedHypothesis === hypothesis.id && <Check className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg text-gray-900 mb-2">{hypothesis.title}</h3>
                        <p className="text-gray-600">{hypothesis.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleContinue}
                  disabled={selectedHypothesis === null}
                  className="px-8"
                >
                  Continue to Editor
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HypothesesPage;
